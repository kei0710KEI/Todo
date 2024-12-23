import './globals.css';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['400', '700'], // フォントの太さ
  subsets: ['latin'], // サポートする文字セット
});

export const metadata = {
  title: 'ToDoリスト',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={roboto.className}>
      <body>{children}</body>
    </html>
  );
}


