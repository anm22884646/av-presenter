import { Compositor } from '../compositor';
const renderer=new Compositor(document.querySelector<HTMLElement>('#program')!,'output');
window.av.onSnapshot(snapshot=>renderer.update(snapshot.program));
void window.av.getSnapshot().then(snapshot=>renderer.update(snapshot.program));
