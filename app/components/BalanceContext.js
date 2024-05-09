import { createContext, useState, useContext } from "react";

const BalanceContext = createContext(null);

export function useBalance() {
  const context = useContext(BalanceContext);
  if (context === null) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
}

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  const updateBalance = (newBalance) => {
    setBalance(newBalance);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};
