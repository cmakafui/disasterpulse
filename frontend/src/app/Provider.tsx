import React, { ReactNode } from "react";
import Header from "./_components/Header";

interface Props {
  children: ReactNode;
}

function Provider({ children }: Props) {
  return (
    <div>
      <Header />
      <div className="mt-[5rem]">{children}</div> {/* Adjusted margin-top */}
    </div>
  );
}

export default Provider;
