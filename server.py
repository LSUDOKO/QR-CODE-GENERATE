import http.server
import socketserver
import webbrowser
from pathlib import Path

PORT = 8000

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent.absolute()), **kwargs)

Handler = MyHttpRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server started at http://localhost:{PORT}/")
    print("Press Ctrl+C to stop the server.")
    
    # Open the default web browser
    webbrowser.open(f"http://localhost:{PORT}/")
    
    # Keep the server running
    httpd.serve_forever()
