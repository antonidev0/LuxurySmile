// models/appointment.js
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  ci: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["pendiente", "confirmada", "cancelada", "completada"],
    default: "pendiente",
    required: false
  },
  assignedDoctors: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff", // Relación con el modelo Staff (doctores/administradores) 
  },
],

historialPDF: {
  type: String, // o usa Buffer si prefieres almacenarlo directamente en MongoDB
  default: null
},

completedBy: [
  {
    name: { type: String },
    ci: { type: String },
    email: { type: String },
    specialty: { type: String },
  }
],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
