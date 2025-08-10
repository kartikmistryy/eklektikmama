import "./globals.css";
import { Anton, Antonio, Poppins, Quicksand } from "next/font/google";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";


const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const antonio = Antonio({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700"], variable: "--font-antonio" });
const poppins = Poppins({ subsets: ["latin"], weight: ["100","200","300","400","500","600","700","800","900"], style: ["normal","italic"], variable: "--font-poppins" });
const quicksand = Quicksand({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-quicksand" });

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${antonio.variable} ${poppins.variable} ${quicksand.variable}`}
    >
      <body>
      <Navbar/>
        {children}
      <Footer/>
      </body>
    </html>
  );
}