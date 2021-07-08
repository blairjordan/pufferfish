export const Styles = {
  general: [
    { type: 'region',        prop: 'bgcolor',  value: '#ffffe6' },
    { type: 'vnet',          prop: 'bgcolor',  value: '#FFFFCC' },
    { type: 'vnet-peer',     prop: 'color',    value: '#E3C800' },
    { type: 'vnet-peer',     prop: 'penwidth', value: 2},
    { type: 'vnet-dns',      prop: 'color',    value: '#3399FF' },
    { type: 'vnet-dns',      prop: 'penwidth', value: 2},
    { type: 'data-transfer', prop: 'color',    value: '#888888' },
    { type: 'subnet',        prop: 'style',    value: 'dashed' },
    { type: 'vnet',          prop: 'style',    value: 'rounded' }
  ],
  dev: [
    { type: 'subnet',  prop: 'bgcolor', value: '#E2F0CB' },
    { type: 'vnet',    prop: 'bgcolor', value: '#B5EAD7' },
    { type: 'env',     prop: 'bgcolor', value: '#D8F2E9' }
  ],
  prod: [
    { type: 'subnet',  prop: 'bgcolor', value: '#FFDAC1' },
    { type: 'vnet',    prop: 'bgcolor', value: '#FFB7B2' },
    { type: 'env',     prop: 'bgcolor', value: '#FFEAE8' }
  ]
};
