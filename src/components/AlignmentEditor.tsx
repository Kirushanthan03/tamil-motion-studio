import React, { useState } from 'react';
import { TranscriptSegment } from '@/types';
import { Edit2, Check, Clock, AlertCircle } from 'lucide-react';

interface Props {
  transcript: TranscriptSegment[];
  onUpdateTranscript: (t: TranscriptSegment[]) => void;
}

export const AlignmentEditor: React.FC<Props> = ({ transcript, onUpdateTranscript }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (seg: TranscriptSegment) => {
    setEditingId(seg.id);
    setEditText(seg.text);
  };

  const handleSaveEdit = (segId: string) => {
    const updated = transcript.map((s) => {
      if (s.id === segId) {
        return {
          ...s,
          text: editText,
        };
      }
      return s;
    });
    onUpdateTranscript(updated);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-charcoal">
          Transcript & Word Timestamp Alignment
        </h3>
        <span className="text-xs text-charcoal-muted">
          Click any phrase to edit deviations from original script
        </span>
      </div>

      <div className="space-y-2.5">
        {transcript.map((seg, idx) => {
          const isEditing = editingId === seg.id;
          return (
            <div
              key={seg.id || idx}
              className="bg-paper p-4 rounded-xl border border-paper-border flex flex-col gap-2 hover:border-paper-border transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-crimson-accent flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {seg.start.toFixed(2)}s → {seg.end.toFixed(2)}s ({(seg.end - seg.start).toFixed(1)}s)
                </span>

                {isEditing ? (
                  <button
                    onClick={() => handleSaveEdit(seg.id)}
                    className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Done
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(seg)}
                    className="text-xs text-charcoal-muted hover:text-charcoal px-2 py-1 rounded flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full bg-paper-pure p-2 rounded border border-paper-border font-serif text-charcoal text-sm focus:outline-none focus:ring-1 focus:ring-crimson-accent"
                  rows={2}
                />
              ) : (
                <p className="font-serif text-charcoal text-base leading-relaxed">
                  {seg.text}
                </p>
              )}

              {/* Word breakdown pill tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {(seg.words || []).map((w, wIdx) => (
                  <span
                    key={wIdx}
                    className="text-[11px] bg-paper-pure border border-paper-border px-2 py-0.5 rounded text-charcoal-muted font-mono"
                    title={`${w.start}s - ${w.end}s`}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
