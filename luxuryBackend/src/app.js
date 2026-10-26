import cors from "cors";
import express from "express";
import helmet from "helmet";
import { CLIENT_ORIGINS, TRUST_PROXY } from "./config.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.js";
import doctorRoutes from "./routes/doctor.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

if (TRUST_PROXY !== undefined) app.set("trust proxy", TRUST_PROXY);

app.use(helmet());
app.use(cors({ origin: CLIENT_ORIGINS }));
app.use(express.json());

// Los historiales PDF no se sirven como estáticos: se descargan con sesión en GET /api/admin/:id/pdf.
// Las citas solo las crea el personal autenticado: no hay ruta pública de reserva.
app.use("/api/pdf", pdfRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
