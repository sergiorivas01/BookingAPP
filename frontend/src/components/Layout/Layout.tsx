import { ReactNode } from "react";
import Navigation from "./Navigation";
import ColorBends from "../ColorBends/ColorBends";
import "./Layout.css";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <div className="color-bends-background">
        <ColorBends
          colors={["#4DA3FF", "#8a5cff", "#00ffd1"]}
          rotation={30}
          speed={0.06}
          scale={2}
          frequency={5}
          warpStrength={1.1}
          mouseInfluence={1.5}
          parallax={0.6}
          noise={0.01}
        />
      </div>
      <Navigation />
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
