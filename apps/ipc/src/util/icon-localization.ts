// eslint-disable-next-line n/no-extraneous-import
import carbon from '@iconify/json/json/carbon.json';
// eslint-disable-next-line n/no-extraneous-import
import ep from '@iconify/json/json/ep.json';
// eslint-disable-next-line n/no-extraneous-import
import fluentMdl2 from '@iconify/json/json/fluent-mdl2.json';
// eslint-disable-next-line n/no-extraneous-import
import iconParkSolid from '@iconify/json/json/icon-park-solid.json';
// eslint-disable-next-line n/no-extraneous-import
import mdiLight from '@iconify/json/json/mdi-light.json';
// eslint-disable-next-line n/no-extraneous-import
import mdi from '@iconify/json/json/mdi.json';
// eslint-disable-next-line n/no-extraneous-import
import oui from '@iconify/json/json/oui.json';
// eslint-disable-next-line n/no-extraneous-import
import svgSpinners from '@iconify/json/json/svg-spinners.json';
// eslint-disable-next-line n/no-extraneous-import
import { addCollection } from '@iconify/vue';

export default function loadIconCollection() {
  addCollection(mdi);
  addCollection(mdiLight);
  addCollection(iconParkSolid);
  addCollection(oui);
  addCollection(ep);
  addCollection(carbon);
  addCollection(fluentMdl2);
  addCollection(svgSpinners);
}
