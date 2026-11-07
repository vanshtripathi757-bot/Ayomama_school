/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { ErrorBoundary } from './app/ErrorBoundary';
import { LoadingScreen } from './components/loading/LoadingScreen';
import { CreditsModal } from './components/menu/CreditsModal';
import { ExitModal } from './components/menu/ExitModal';
import { MainMenu } from './components/menu/MainMenu';
import { NewGameModal } from './components/menu/NewGameModal';
import { SettingsModal } from './components/menu/SettingsModal';
import { PreGameFlowScreens } from './components/screens/PreGameFlowScreens';
import { AcademyHUD } from './components/ui/AcademyHUD';
import { AcademyCanvas } from './game/scene/AcademyCanvas';
import { useGameStore } from './store/useGameStore';

export default function App() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (useGameStore.getState().phase === 'loading') {
        void useGameStore.getState().initializeStore();
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative w-screen h-screen overflow-hidden bg-[#090d16] select-none">
        {/* Isolated 3D WebGL Renderer Container */}
        <AcademyCanvas />

        {/* Game Shell & V7.0 Entry Flow Overlays */}
        <LoadingScreen />
        <MainMenu />
        <PreGameFlowScreens />
        <AcademyHUD />

        {/* Modal Dialogs */}
        <NewGameModal />
        <SettingsModal />
        <CreditsModal />
        <ExitModal />
      </div>
    </ErrorBoundary>
  );
}
