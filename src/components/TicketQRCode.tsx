/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface TicketQRCodeProps {
  text: string;
}

export default function TicketQRCode({ text }: TicketQRCodeProps) {
  const [qrSrc, setQrSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(
      text,
      {
        width: 160,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (err) {
          console.error('Failed to generate QR code', err);
          return;
        }
        if (active) {
          setQrSrc(url);
        }
      }
    );
    return () => {
      active = false;
    };
  }, [text]);

  if (!qrSrc) {
    return (
      <div className="w-28 h-28 mx-auto bg-black/5 flex flex-col items-center justify-center border-2 border-dashed border-black font-mono-custom text-[9px] uppercase font-bold text-gray-500">
        <span className="animate-pulse">GENERATING QR...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-1 border-2 border-black inline-block shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all">
      <img src={qrSrc} alt={`Pass key: ${text}`} className="w-28 h-28 object-contain" />
    </div>
  );
}
