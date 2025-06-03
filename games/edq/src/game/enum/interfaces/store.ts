export interface GameState {
    runningGame: boolean;
    setRunningGame: (running: boolean) => void;
    loadingGame: boolean;
    setLoadingGame: (loading: boolean) => void;
    paused: boolean;
    setPaused: (paused: boolean) => void;
    uiLayers: {
        inGameLayer: {
            visible: boolean;
            setVisible: (visible: boolean) => void;
            hudLayer: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            victoryMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            gameOverMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            pauseMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
        };
        generalLayer: {
            visible: boolean;
            setVisible: (visible: boolean) => void;
            loadingScreen: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            mainMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            levelsMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            SettingsMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
            controlsMenu: {
                visible: boolean;
                setVisible: (visible: boolean) => void;
            };
        };
    };
}
