package com.spotifyclone.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.os.PowerManager
import android.view.KeyEvent
import android.view.View
import android.view.WindowManager
import android.webkit.*
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private var wakeLock: PowerManager.WakeLock? = null
    private val APP_URL = "https://spotify-copy-clone.vercel.app"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.statusBarColor = Color.TRANSPARENT
        window.navigationBarColor = Color.parseColor("#000000")
        val ctrl = WindowInsetsControllerCompat(window, window.decorView)
        ctrl.isAppearanceLightStatusBars = false
        ctrl.isAppearanceLightNavigationBars = false
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Wake lock — keeps CPU alive when screen off so audio plays
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "SpotifyClone::WakeLock")
        wakeLock?.acquire(12 * 60 * 60 * 1000L) // 12 hours

        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        setupWebView()
        
        // Force clear cache and load NEW url to ensure fixes show up on mobile
        webView.clearCache(true)
        WebStorage.getInstance().deleteAllData()
        CookieManager.getInstance().removeAllCookies(null)
        webView.loadUrl(APP_URL)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            allowFileAccess = true
            setSupportZoom(false)
            builtInZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportMultipleWindows(true)
            userAgentString = "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        }
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return when {
                    url.startsWith("https://spotify-copy-clone.vercel.app") -> false
                    url.startsWith("blob:") -> false
                    url.contains("saavn.dev") -> false
                    url.contains("lrclib.net") -> false
                    url.contains("lyrics.ovh") -> false
                    else -> { try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } catch (_:Exception) {}; true }
                }
            }
            override fun onPageStarted(view: WebView, url: String, favicon: android.graphics.Bitmap?) {
                progressBar.visibility = View.VISIBLE
            }
            override fun onPageFinished(view: WebView, url: String) {
                progressBar.visibility = View.GONE
                webView.evaluateJavascript("""
                    (function(){
                        window.isAndroidApp = true;
                        document.body.style.webkitTapHighlightColor='transparent';
                        document.body.style.userSelect='none';
                        // Track audio element globally
                        var orig = HTMLAudioElement.prototype.play;
                        HTMLAudioElement.prototype.play = function(){
                            window.__audio = this; this.muted = false;
                            return orig.apply(this,arguments);
                        };
                        // Keep playing when screen turns off
                        document.addEventListener('visibilitychange',function(){
                            if(document.hidden && window.__audio && !window.__audio.paused){
                                window.__audio.play().catch(function(){});
                            }
                        });
                        // Lock screen media controls
                        if('mediaSession' in navigator){
                            navigator.mediaSession.setActionHandler('play',function(){window.__audio?.play();});
                            navigator.mediaSession.setActionHandler('pause',function(){window.__audio?.pause();});
                            navigator.mediaSession.setActionHandler('nexttrack',function(){window.dispatchEvent(new CustomEvent('mobile_next'));});
                            navigator.mediaSession.setActionHandler('previoustrack',function(){window.dispatchEvent(new CustomEvent('mobile_prev'));});
                        }
                        // Unlock audio on first touch
                        document.addEventListener('touchstart',function unlock(){
                            var ctx=new (window.AudioContext||window.webkitAudioContext)();
                            ctx.resume().then(function(){ctx.close();});
                            document.removeEventListener('touchstart',unlock);
                        },{once:true});
                    })();
                """.trimIndent(), null)
            }
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    view.loadData("""<html><body style="background:#121212;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><div style="text-align:center;color:white;"><div style="font-size:60px;margin-bottom:20px">🎵</div><h2 style="color:#1DB954;margin-bottom:12px">No Connection</h2><p style="color:#b3b3b3;margin-bottom:24px">Check internet and retry</p><button onclick="location.reload()" style="background:#1DB954;color:black;border:none;padding:14px 40px;border-radius:500px;font-size:16px;font-weight:800;cursor:pointer">Retry</button></div></body></html>""", "text/html", "UTF-8")
                }
            }
            override fun onReceivedSslError(view: WebView, handler: android.webkit.SslErrorHandler, error: android.net.http.SslError) {
                handler.proceed()
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress < 100) View.VISIBLE else View.GONE
            }
            override fun onPermissionRequest(request: PermissionRequest) {
                runOnUiThread { request.grant(request.resources) }
            }
            override fun onConsoleMessage(msg: ConsoleMessage): Boolean {
                android.util.Log.d("SpotifyClone", msg.message())
                return true
            }
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) { webView.goBack(); return true }
        return super.onKeyDown(keyCode, event)
    }
    override fun onSaveInstanceState(outState: Bundle) { super.onSaveInstanceState(outState); webView.saveState(outState) }
    override fun onResume() { super.onResume(); webView.onResume(); webView.resumeTimers() }
    override fun onPause() { super.onPause() /* DON'T pause webview - keeps audio playing */ }
    override fun onDestroy() { wakeLock?.release(); webView.destroy(); super.onDestroy() }
}
