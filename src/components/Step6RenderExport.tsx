import React, { useState } from 'react';
import { Project } from '@/types';
import { Download, Sparkles, CheckCircle2, Copy, Check, FileVideo, Image as ImageIcon, Share2, AlertCircle } from 'lucide-react';

interface Props {
  project: Project;
  renderProgress: any;
  onTriggerRender: () => void;
}

export const Step6RenderExport: React.FC<Props> = ({
  project,
  renderProgress,
  onTriggerRender,
}) => {
  const [copiedCaption, setCopiedCaption] = useState(false);

  const isRendering = project.status === 'RENDERING' || renderProgress?.status === 'RENDERING' || renderProgress?.status === 'BUNDLING';
  const isCompleted = project.status === 'COMPLETED' || renderProgress?.status === 'COMPLETED';
  const progressPercent = Math.round((renderProgress?.progress || 0) * 100);

  const videoUrl = project.renderOutput?.videoUrl || renderProgress?.outputVideoUrl;
  const thumbnailUrl = project.renderOutput?.thumbnailUrl || renderProgress?.outputThumbnailUrl;
  const social = project.socialPackage;

  const handleCopyCaption = () => {
    if (social?.caption) {
      navigator.clipboard.writeText(social.caption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="bg-paper-pure rounded-2xl border border-paper-border p-8 shadow-editorial">
        <div className="pb-6 border-b border-paper-border">
          <span className="text-xs font-bold tracking-widest text-crimson-accent uppercase bg-crimson-50 px-3 py-1 rounded">
            STEP 06 // PRODUCTION EXPORT
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal mt-2">
            Final Render & Social Media Package
          </h1>
          <p className="text-charcoal-muted text-sm mt-1">
            Export ready-to-post 1080x1920 MP4 for Instagram Reels, YouTube Shorts, and TikTok with synchronized captions and metadata.
          </p>
        </div>

        {/* Render In Progress State */}
        {isRendering && (
          <div className="mt-8 bg-paper p-8 rounded-2xl border border-paper-border text-center space-y-4">
            <Sparkles className="w-12 h-12 text-crimson-accent mx-auto animate-spin" />
            <h3 className="font-serif font-bold text-2xl text-charcoal">
              Rendering Vertical Video ({progressPercent}%)
            </h3>
            <p className="text-charcoal-muted text-sm max-w-md mx-auto">
              Synthesizing kinetic typography, SVG diagrams, and audio track into high-bitrate H.264 MP4.
            </p>

            <div className="w-full max-w-lg mx-auto bg-paper-border h-3 rounded-full overflow-hidden">
              <div
                className="bg-crimson-accent h-full transition-all duration-300 rounded-full shadow-crimson-glow"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
            <span className="text-xs font-mono text-charcoal-muted block">
              Frame {renderProgress?.renderedFrames || 0} / {renderProgress?.totalFrames || 900}
            </span>
          </div>
        )}

        {/* Render Completed State */}
        {isCompleted && (
          <div className="mt-8 space-y-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-emerald-950">
                    Production Render Completed!
                  </h3>
                  <span className="text-xs text-emerald-800">
                    Resolution: 1080x1920 (9:16) • FPS: 30 • Codec: H.264 / AAC
                  </span>
                </div>
              </div>

              {videoUrl && (
                <a
                  href={videoUrl}
                  download="reel.mp4"
                  className="bg-crimson-accent hover:bg-crimson-deep text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-crimson-glow transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download MP4</span>
                </a>
              )}
            </div>

            {/* Video Preview & Cover Still */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* MP4 Player */}
              <div className="bg-paper rounded-2xl border border-paper-border p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
                  <FileVideo className="w-4 h-4 text-crimson-accent" />
                  <span>Rendered Video Player</span>
                </div>
                {videoUrl && (
                  <div className="rounded-xl overflow-hidden shadow-lg border border-paper-border bg-black aspect-[9/16] max-h-[500px] flex items-center justify-center mx-auto">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Cover Thumbnail & Social Media Box */}
              <div className="space-y-6">
                {thumbnailUrl && (
                  <div className="bg-paper rounded-2xl border border-paper-border p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
                      <ImageIcon className="w-4 h-4 text-crimson-accent" />
                      <span>Exported Cover Still</span>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-paper-border shadow max-h-[220px]">
                      <img
                        src={thumbnailUrl}
                        alt="Reel Cover Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Social Package */}
                {social && (
                  <div className="bg-paper rounded-2xl border border-paper-border p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal">
                        <Share2 className="w-4 h-4 text-crimson-accent" />
                        <span>Ready-to-Post Social Caption</span>
                      </div>
                      <button
                        onClick={handleCopyCaption}
                        className="text-xs bg-paper-pure hover:bg-paper-border border border-paper-border px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 text-charcoal"
                      >
                        {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCaption ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="font-serif text-sm text-charcoal bg-paper-pure p-3.5 rounded-lg border border-paper-border whitespace-pre-wrap leading-relaxed">
                      {social.caption}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {social.hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-crimson-50 text-crimson-accent font-mono px-2 py-0.5 rounded font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Failed or Idle Re-render State */}
        {!isRendering && !isCompleted && (
          <div className="mt-8 text-center py-10 bg-paper rounded-2xl border border-dashed border-paper-border space-y-4">
            <h3 className="font-serif font-bold text-xl text-charcoal">
              Ready to Render MP4 Video
            </h3>
            <p className="text-charcoal-muted text-sm max-w-md mx-auto">
              Click the render button to produce the final 1080x1920 video with synchronized voiceover and animated scenes.
            </p>
            <button
              onClick={onTriggerRender}
              className="bg-crimson-accent hover:bg-crimson-deep text-white px-8 py-3 rounded-xl font-bold text-sm inline-flex items-center gap-2 shadow-crimson-glow"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start MP4 Render</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
