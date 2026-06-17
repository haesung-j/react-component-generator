import { useState } from 'react';
import { LiveProvider, LivePreview as ReactLivePreview, LiveError } from 'react-live';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORTS: Record<Viewport, { label: string; width: string }> = {
  mobile:  { label: '모바일',   width: '375px' },
  tablet:  { label: '태블릿',   width: '768px' },
  desktop: { label: '데스크탑', width: '100%'  },
};

interface LivePreviewProps {
  code: string;
}

export function LivePreview({ code }: LivePreviewProps) {
  const [viewport, setViewport] = useState<Viewport>('desktop');

  return (
    <div className="preview-panel">
      <div className="panel-header">
        <h3>미리보기</h3>
        <div className="viewport-toggle">
          {(Object.keys(VIEWPORTS) as Viewport[]).map((vp) => (
            <button
              key={vp}
              className={`btn-viewport ${viewport === vp ? 'btn-viewport--active' : ''}`}
              onClick={() => setViewport(vp)}
            >
              {VIEWPORTS[vp].label}
            </button>
          ))}
        </div>
      </div>
      <div className="preview-content">
        <LiveProvider code={code} noInline>
          <div className="preview-render">
            <div
              className="preview-viewport"
              style={{ maxWidth: VIEWPORTS[viewport].width }}
            >
              <ReactLivePreview />
            </div>
          </div>
          <LiveError className="preview-error" />
        </LiveProvider>
      </div>
    </div>
  );
}
