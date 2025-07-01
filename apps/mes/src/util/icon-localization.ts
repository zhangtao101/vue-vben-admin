// eslint-disable-next-line n/no-extraneous-import
import ep from '@iconify/json/json/ep.json';
// eslint-disable-next-line n/no-extraneous-import
import iconParkSolid from '@iconify/json/json/icon-park-solid.json';
// eslint-disable-next-line n/no-extraneous-import
import mdiLight from '@iconify/json/json/mdi-light.json';
// eslint-disable-next-line n/no-extraneous-import
import mdi from '@iconify/json/json/mdi.json';
// eslint-disable-next-line n/no-extraneous-import
import oui from '@iconify/json/json/oui.json';
// eslint-disable-next-line n/no-extraneous-import
import { addCollection } from '@iconify/vue';

export default function loadIconCollection() {
  addCollection(mdi);
  addCollection(iconParkSolid);
  addCollection(oui);
  addCollection(ep);
  addCollection(mdiLight);
}
