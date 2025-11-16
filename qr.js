import QRCode from 'qrcode';

const url = 'https://www.innovafound.website';

QRCode.toFile('qr_innovafound.png', url, {
  width: 500,
  color: {
    dark: '#000000',
    light: '#FFFFFF'
  }
})
  .then(() => console.log("QR generado: qr_innovafound.png"))
  .catch(err => console.error(err));
