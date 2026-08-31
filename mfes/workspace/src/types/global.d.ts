import * as React from 'react';

declare global {
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      "sunbird-pdf-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "player-config"?: string;
      };
      "sunbird-quml-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "player-config"?: string;
      };
      "sunbird-video-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "player-config"?: string;
        onEvent?: any;
        onTelemetry?: any;
      };
      "sunbird-epub-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "player-config"?: string;
        onEvent?: any;
        onTelemetry?: any;
      };
    }
  }
}

// Fallback for older tsconfig configurations
declare namespace JSX {
  interface IntrinsicElements {
    "sunbird-pdf-player": any;
    "sunbird-quml-player": any;
    "sunbird-video-player": any;
    "sunbird-epub-player": any;
  }
}
