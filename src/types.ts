export interface GameConfig {
  id: string;
  name: string;
  url: string;
}

export type HostToGameMessage =
  | { type: 'START'; durationMs: number }
  | { type: 'STOP' };

export type GameToHostMessage =
  | { type: 'READY' }
  | { type: 'SCORE'; value: number }
  | { type: 'END' }; 
