#!/usr/bin/env python3
import json, os, shutil, ssl, subprocess, tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST='127.0.0.1'; PORT=8765
HERE=os.path.dirname(os.path.abspath(__file__))
CERT=os.path.join(HERE,'palm-localhost.crt')
KEY=os.path.join(HERE,'palm-localhost.key')
GS=shutil.which('gs') or '/opt/homebrew/bin/gs'
MAX_BYTES=500*1024*1024

class H(BaseHTTPRequestHandler):
    server_version='PALMLocalPDFOptimizer/1.3'
    protocol_version='HTTP/1.1'
    def log_message(self, fmt, *args): print('[PALM]', fmt%args, flush=True)
    def cors(self):
        self.send_header('Access-Control-Allow-Origin','https://wiroseta.github.io')
        self.send_header('Vary','Origin')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type, Accept, X-PALM-Normalize-A4')
        self.send_header('Connection','close')
        self.send_header('Access-Control-Allow-Private-Network','true')
    def do_OPTIONS(self):
        print('[PALM] OPTIONS', self.path, 'Origin=', self.headers.get('Origin'), flush=True)
        self.send_response(204); self.cors(); self.end_headers()
    def do_GET(self):
        print('[PALM] GET', self.path, 'Origin=', self.headers.get('Origin'), flush=True)
        if self.path!='/health': self.send_error(404); return
        ok=os.path.isfile(GS) and os.access(GS,os.X_OK)
        b=json.dumps({'ok':ok,'ghostscript':ok,'version':'1.3','https':True}).encode()
        self.send_response(200 if ok else 503); self.cors(); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b); self.close_connection=True
    def do_POST(self):
        print('[PALM] POST', self.path, 'Origin=', self.headers.get('Origin'), 'Bytes=', self.headers.get('Content-Length'), flush=True)
        if self.path!='/optimize': self.send_error(404); return
        try:
            n=int(self.headers.get('Content-Length','0'))
            if n<=0 or n>MAX_BYTES: raise ValueError('Ukuran PDF tidak valid / lebih dari 500 MB.')
            data=self.rfile.read(n)
            if not data.startswith(b'%PDF-'): raise ValueError('Input bukan PDF yang valid.')
            if not (os.path.isfile(GS) and os.access(GS,os.X_OK)): raise RuntimeError('Ghostscript tidak ditemukan.')
            with tempfile.TemporaryDirectory(prefix='palm-pdf-') as d:
                src=os.path.join(d,'input.pdf'); out=os.path.join(d,'output.pdf')
                open(src,'wb').write(data)
                normalize_a4=self.headers.get('X-PALM-Normalize-A4','0')=='1'
                # PALM Legal Document Quality: 300 dpi for color/gray scans, 600 dpi for monochrome.
                # Some scanner PDFs incorrectly use image pixels as PDF points (e.g. ~70 x 90 inch pages).
                # Only those abnormal pages are normalized to A4; normal PDF page sizes are preserved.
                cmd=[GS,'-sDEVICE=pdfwrite','-dCompatibilityLevel=1.6','-dNOPAUSE','-dQUIET','-dBATCH',
                     '-dDetectDuplicateImages=true','-dCompressFonts=true','-dSubsetFonts=true',
                     '-dDownsampleColorImages=true','-dColorImageResolution=300','-dColorImageDownsampleThreshold=1.0',
                     '-dDownsampleGrayImages=true','-dGrayImageResolution=300','-dGrayImageDownsampleThreshold=1.0',
                     '-dDownsampleMonoImages=true','-dMonoImageResolution=600','-dMonoImageDownsampleThreshold=1.0']
                if normalize_a4: cmd += ['-dFIXEDMEDIA','-sPAPERSIZE=a4','-dPDFFitPage']
                cmd += ['-sOutputFile='+out,src]
                p=subprocess.run(cmd,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=300)
                if p.returncode!=0 or not os.path.exists(out): raise RuntimeError('Ghostscript gagal: '+p.stderr.decode('utf-8','replace')[-1000:])
                result=open(out,'rb').read()
                if not result.startswith(b'%PDF-'): raise RuntimeError('Output Ghostscript bukan PDF valid.')
            print('[PALM] Ghostscript selesai:', n, '->', len(result), 'bytes', flush=True)
            self.send_response(200); self.cors(); self.send_header('Content-Type','application/pdf'); self.send_header('Content-Length',str(len(result))); self.end_headers(); self.wfile.write(result); self.close_connection=True
        except Exception as e:
            print('[PALM] ERROR:', e, flush=True)
            b=str(e).encode('utf-8'); self.send_response(500); self.cors(); self.send_header('Content-Type','text/plain; charset=utf-8'); self.send_header('Content-Length',str(len(b))); self.end_headers(); self.wfile.write(b); self.close_connection=True

class PALMHTTPServer(ThreadingHTTPServer):
    daemon_threads=True
    allow_reuse_address=True
    def handle_error(self, request, client_address):
        import sys
        exc=sys.exc_info()[1]
        if isinstance(exc,(ConnectionResetError,BrokenPipeError,ssl.SSLError)):
            print('[PALM] koneksi browser ditutup sebelum request selesai:', type(exc).__name__, flush=True)
            return
        super().handle_error(request,client_address)

if __name__=='__main__':
    if not (os.path.exists(CERT) and os.path.exists(KEY)):
        raise SystemExit('Sertifikat HTTPS lokal belum ada. Jalankan start_palm_optimizer.command.')
    httpd=PALMHTTPServer((HOST,PORT),H)
    ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain(CERT,KEY)
    httpd.socket=ctx.wrap_socket(httpd.socket,server_side=True)
    print(f'PALM Local PDF Optimizer HTTPS: https://localhost:{PORT}', flush=True)
    print('Ghostscript:', GS, flush=True)
    httpd.serve_forever()
