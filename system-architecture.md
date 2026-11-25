<img width="2784" height="2316" alt="mermaid-diagram" src="https://github.com/user-attachments/assets/032bd463-e780-4990-b602-7501f766a8c1" />
flowchart TD
    A[Passenger] --> C[Frontend: React + Vite]
    B[Administrator] --> C

    C -->|HTTP Requests / JSON| D[Backend API: Node.js + Express]

    D --> E[API Routes]
    E --> F[Middleware: JWT Authentication and Role Authorization]
    F --> G[Controllers]
    G --> H[Services / Business Logic]

    H --> H1[Authentication and Users]
    H --> H2[Bus and Route Management]
    H --> H3[Trip and Seat Management]
    H --> H4[Booking and Cancellation]
    H --> H5[Payment and Administration]

    H1 --> I[Prisma ORM]
    H2 --> I
    H3 --> I
    H4 --> I
    H5 --> I

    I --> J[(PostgreSQL Database)]
    ![Uploading mermaid-diagram.png…]()
