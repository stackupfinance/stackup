export type Networks = 'Polygon';

type NetworksConfig = {
  name: string;
  color: string;
};

export const NetworksConfig: Record<Networks, NetworksConfig> = {
  Polygon: {
    name: 'Polygon Network',
    color: '#7830d2cc',
  },
};
