import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Frets from './Frets';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Frets />, document.getElementById('root'));
registerServiceWorker();
