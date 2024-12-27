import { useSelector } from 'react-redux';
import { QRCodeCanvas } from 'qrcode.react';
import { Alert } from 'flowbite-react';

export default function ConferenceEntry() {
  const { currentUser } = useSelector((state) => state.user);

  if (!currentUser) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Alert color='failure'>You need to be signed in to view this page.</Alert>
      </div>
    );
  }

  const qrData = JSON.stringify({
    username: currentUser.username,
    email: currentUser.email,
  });

  return (
    <div className='min-h-screen flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-semibold mb-5'>Conference Entry QR Code</h1>
      <QRCodeCanvas value={qrData} size={256} />
      <p className='mt-5'>Show this QR code at the conference entry.</p>
    </div>
  );
}
