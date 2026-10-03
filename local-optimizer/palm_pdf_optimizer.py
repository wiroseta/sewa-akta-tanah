#!/usr/bin/env python3
import json, os, shutil, ssl, subprocess, tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HOST='127.0.0.1'; PORT=8765
HERE=os.path.dirname(os.path.abspath(__file__))
CERT=os.path.join(HERE,'palm-localhost.crt')
KEY=os.path.join(HERE,'palm-localhost.key')
GS=shutil.which('gs') or '/opt/homebrew/bin/gs'
MAGICK=shutil.which('magick') or ('/opt/homebrew/bin/magick' if os.path.exists('/opt/homebrew/bin/magick') else '')
MAX_BYTES=500*1024*1024

class H(BaseHTTPRequestHandler):
    server_version='PALMLocalPDFOptimizer/1.4'
    protocol_version='HTTP/1.1'
    def log_message(self, fmt, *args): print('[PALM]', fmt%args, flush=True)
    def cors(self):
        self.send_header('Access-Control-Allow-Origin','https://wiroseta.github.io')
        self.send_header('Vary','Origin')
        self.send_header('Access-Control-Allow-Methods','GET,POST,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type, Accept, X-PALM-Normalize-Aspect, X-PALM-Target-Width-PT, X-PALM-Target-Height-PT, X-PALM-Auto-Deskew')
        self.send_header('Connection','close')
        self.send_header('Access-Control-Allow-Private-Network','true')
    def do_OPTIONS(self):
        print('[PALM] OPTIONS', self.path, 'Origin=', self.headers.get('Origin'), flush=True)
        self.send_response(204); self.cors(); self.end_headers()
    def do_GET(self):
        print('[PALM] GET', self.path, 'Origin=', self.headers.get('Origin'), flush=True)
        if self.path!='/health': self.send_error(404); return
        ok=os.path.isfile(GS) and os.access(GS,os.X_OK)
        b=json.dumps({'ok':ok,'ghostscript':ok,'imagemagick':bool(MAGICK and os.path.isfile(MAGICK)),'deskew':bool(MAGICK and os.path.isfile(MAGICK)),'version':'1.4','https':True}).encode()
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
                normalize_aspect=self.headers.get('X-PALM-Normalize-Aspect','0')=='1'
                auto_deskew=self.headers.get('X-PALM-Auto-Deskew','0')=='1'
                try:
                    target_w=float(self.headers.get('X-PALM-Target-Width-PT','0') or 0)
                    target_h=float(self.headers.get('X-PALM-Target-Height-PT','0') or 0)
                except ValueError:
                    target_w=target_h=0
                # PALM Legal Document Quality: preserve the scan's aspect ratio, 300 dpi color/gray, 600 dpi mono.
                # Abnormal scanner page sizes are mapped to a sane physical size WITHOUT forcing A4, avoiding
                # full-width white bands and avoiding crop/distortion. Optional conservative deskew is applied
                # only when ImageMagick is available; the original Drive backup remains untouched.
                def gs_cmd(inp, output, fixed=False):
                    c=[GS,'-sDEVICE=pdfwrite','-dCompatibilityLevel=1.6','-dNOPAUSE','-dQUIET','-dBATCH',
                       '-dDetectDuplicateImages=true','-dCompressFonts=true','-dSubsetFonts=true',
                       '-dDownsampleColorImages=true','-dColorImageResolution=300','-dColorImageDownsampleThreshold=1.0',
                       '-dDownsampleGrayImages=true','-dGrayImageResolution=300','-dGrayImageDownsampleThreshold=1.0',
                       '-dDownsampleMonoImages=true','-dMonoImageResolution=600','-dMonoImageDownsampleThreshold=1.0']
                    if fixed and target_w>0 and target_h>0:
                        c += ['-dFIXEDMEDIA',f'-dDEVICEWIDTHPOINTS={target_w:.3f}',f'-dDEVICEHEIGHTPOINTS={target_h:.3f}','-dPDFFitPage','-dModifiesPageSize=true']
                    c += ['-sOutputFile='+output,inp]
                    return c
                first=os.path.join(d,'normalized.pdf') if normalize_aspect else out
                p=subprocess.run(gs_cmd(src,first,normalize_aspect),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=300)
                if p.returncode==0 and auto_deskew and normalize_aspect and MAGICK and os.path.isfile(MAGICK):
                    desk=os.path.join(d,'deskew.pdf')
                    # 60% is intentionally conservative. ImageMagick only rotates when it detects a useful skew.
                    m=subprocess.run([MAGICK,'-density','300',first,'-background','white','-deskew','60%','-quality','92',desk],stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=300)
                    if m.returncode==0 and os.path.exists(desk):
                        p=subprocess.run(gs_cmd(desk,out,False),stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=300)
                    else:
                        shutil.copyfile(first,out)
                elif p.returncode==0 and first!=out:
                    shutil.copyfile(first,out)
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
