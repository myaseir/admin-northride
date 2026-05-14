import "./globals.css";
import { Toaster } from "react-hot-toast";


export const metadata = {
  title: "GlaciaGo | Secure Transport Arena",
  description: "High-stakes ride-sharing protocol",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fcfdfd]">
        
            {children}
            <Toaster position="bottom-right" />
          
      </body>
    </html>
  );
}