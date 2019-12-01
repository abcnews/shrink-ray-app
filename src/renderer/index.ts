import { ipcRenderer } from 'electron';
import './styles.css';

if (navigator.appVersion.indexOf('Mac') >= -1) {
  document.documentElement.classList.add('is-mac');
}

const appEl = document.getElementById('app')!;

appEl.innerHTML = `
  <svg viewBox="0 0 24 24" id="dls-icon-download">
    <g fill="none" fill-rule="evenodd">
      <path d="M0 0h24v24H0z" />
      <path
        d="M18.5 13.608L11.987 20 5.5 13.633l1.08-1.06 4.612 4.528L11.189 2l1.583.018.002 15.031 4.616-4.53 1.11 1.089zM19 20.5V22H5l.018-1.5H19z"
        fill="currentColor"
      />
    </g>
  </svg>
  <label></label>
`;

document.body.ondragover = () => {
  appEl.classList.add('over');
  return false;
};

document.body.ondragleave = () => {
  appEl.classList.remove('over');
  return false;
};

document.body.ondragend = () => {
  appEl.classList.remove('over');
  return false;
};

document.body.ondrop = async (event: DragEvent) => {
  if (!event.dataTransfer) {
    return;
  }

  event.preventDefault();
  appEl.classList.remove('over');
  document.body.classList.add('processing');

  const files: File[] = Array.from(event.dataTransfer.files);

  try {
    for (let file of files) {
      await ipcRenderer.invoke('file-path', file.path);
    }
  } catch (error) {
    console.error(error);
  } finally {
    document.body.classList.remove('processing');
    document.body.style.setProperty('--processing-pct', '0');
  }

  return false;
};

ipcRenderer.on('progress', (_event, progress) => {
  document.body.style.setProperty(
    '--processing-pct',
    String(progress.percent / 100)
  );
});
