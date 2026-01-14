import GeneralProvider from 'src/provider';
import SideMenu from 'src/components/SideMenu';
import Header from 'src/components/Header';
import MainContent from 'src/components/MainContent';
import { SideMenuProvider } from 'src/components/SideMenuContext';

export default function WithLayoutGroup({ children }: { children: React.ReactNode }) {
  return (
    <GeneralProvider>
      <SideMenuProvider>
        <SideMenu />
        <Header />
        <MainContent>{children}</MainContent>
      </SideMenuProvider>
    </GeneralProvider>
  );
}
