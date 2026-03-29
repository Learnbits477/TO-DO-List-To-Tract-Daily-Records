graph TB
    subgraph "Presentation Layer"
        UI[User Interface]
        CSS[Styles/Animations]
        DOM[DOM Elements]
    end
    
    subgraph "ViewModel Layer"
        RM[Render Manager]
        TM[Timer Manager]
        MM[Modal Manager]
        TH[Theme Handler]
    end
    
    subgraph "Model Layer"
        SM[State Manager]
        LS[LocalStorage]
        TS[Task Store]
        LSG[Log Store]
        SG[Streak Store]
    end
    
    subgraph "Core Services"
        TE[Timer Engine]
        AE[Audio Engine]
        CE[Clock Engine]
        IE[Import/Export Engine]
    end
    
    UI --> RM
    UI --> TM
    UI --> MM
    UI --> TH
    
    RM --> SM
    TM --> TE
    TM --> AE
    MM --> SM
    TH --> SM
    
    SM --> LS
    SM --> TS
    SM --> LSG
    SM --> SG
    
    TE --> CE
    IE --> LS
