import { cpSync, mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('public/static/fonts', { recursive: true });
cpSync('node_modules/@fontsource/manrope/files','public/static/fonts',{recursive:true});
copyFileSync('node_modules/@fontsource/manrope/latin.css','public/static/manrope.css');
// Fontsource's relative URLs resolve against /static/.
import { readFileSync, writeFileSync } from 'node:fs';
writeFileSync('public/static/manrope.css',readFileSync('public/static/manrope.css','utf8').replaceAll('./files/','./fonts/'));
mkdirSync('public/static/icons/css',{recursive:true});
copyFileSync('node_modules/@fortawesome/fontawesome-free/css/all.min.css','public/static/icons/css/all.min.css');
cpSync('node_modules/@fortawesome/fontawesome-free/webfonts','public/static/icons/webfonts',{recursive:true});
