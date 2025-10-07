flowchart TD

%% Client Side
subgraph ClientSide
    A[User / Client Browser]
    E[Store Refresh Token in Cookie]
end

%% Auth Flow
subgraph AuthFlow
    B[API /auth/login]
    C[DB: Users]
    D[Generate Access & Refresh Token]
end

%% Access Flow
subgraph AccessFlow
    F[API Middleware]
    G[Redis / DB]
    H[Protected Resource Response]
end

%% Refresh Flow
subgraph RefreshFlow
    I[API /auth/refresh]
end

%% Device Management
subgraph DeviceManagement
    J[DB: UserDevice + Redis]
    K[Single Device Policy Check]
    L[Send Email Verification]
end

%% Login
A -->|Submit Login| B
B -->|Validate Credentials| C
C -->|Valid| B
B --> D
D --> E
D --> J
J --> K
K -->|New Device| L
L -->|Verify Device| J

%% Access protected API
E -->|Access API| F
F -->|Verify Access Token| G
G -->|Valid| H

%% Refresh token
E -->|Request Refresh| I
I -->|Verify Refresh Token| G
I -->|Rotate Refresh Token| E
I -->|Issue new Access Token| F

%% Styling
style A fill:#f9f,stroke:#333,stroke-width:1px
style B fill:#bbf,stroke:#333,stroke-width:1px
style C fill:#ddf,stroke:#333,stroke-width:1px
style D fill:#bfb,stroke:#333,stroke-width:1px
style E fill:#bff,stroke:#333,stroke-width:1px
style F fill:#fbf,stroke:#333,stroke-width:1px
style G fill:#ffb,stroke:#333,stroke-width:1px
style H fill:#dfd,stroke:#333,stroke-width:1px
style I fill:#bbf,stroke:#333,stroke-width:1px
style J fill:#bff,stroke:#333,stroke-width:1px
style K fill:#fbb,stroke:#333,stroke-width:1px
style L fill:#ff9,stroke:#333,stroke-width:1px
