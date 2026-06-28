const sharp = require('sharp');

sharp('./src/assets/images/precision_lab_bg_1779763253001.png')
  .resize(400) // reasonable resolution
  .webp({ quality: 15 }) // moderate quality
  .toFile('public/precision-lab-small.webp')
  .then(info => {
    console.log("Success:", info.size / 1024, "KB");
  })
  .catch(err => {
    console.error(err);
  });
