import mongoose from "mongoose";
import { formatDate, formatTime } from "../utils/helper.js";

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    mobilenumber: { type: String, default: "" },
    email: { type: String, default: "" },
    services: { type: String, default: "" },
    address: { type: String, default: "" },
    district: { type: String, default: "" },
    date: { type: String, default: "" },
    paidAmount: { type: String, default: "" },
    qualification: { type: String, default: "" },
    gender: { type: String, default: "" },
    fathername: { type: String, default: "" },
    mothername: { type: String, default: "" },
    pincode: { type: String, default: "" },
    adharnumber: { type: String, default: "" },
    panNumber: { type: String, default: "" },
    identityOption: { type: String, default: "" },
    printOnPanCard: { type: String, default: "" },
    time: { type: String, default: "" },
    comment: { type: String, default: "" },
    status: {
      type: String,
      enum: ["In Progress", "converted", "dead", "followup", "overdue"],
    },
    service: { type: String, default: "" },
    followupDate: { type: Date, default: null },
    existingpancardnumber: { type: String, default: "" },
    villageTownCity: { type: String, default: "" },
    pancardstate: { type: String, default: "" },
    pancarddistrict: { type: String, default: "" },
    orderId: { type: String, unique: true },
    insurance_registration_number: { type: String, default: "" },
    registration_date: { type: String, default: "" },
    applying_for: { type: String, default: "" },
    employmentType: { type: String, default: "" },
    nearby_police_station: { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    registrationDate: { type: Date, default: null },
    disease: { type: String, default: "" },
    stampPaper: { type: String, default: "" },
    ownername: { type: String, default: "" },
    ownerage: { type: String, default: "" },
    ownersfathername: { type: String, default: "" },
    ownerAddress: { type: String, default: "" },
    tenantName: { type: String, default: "" },
    tenantage: { type: String, default: "" },
    tenantsfathername: { type: String, default: "" },
    tenantspermanent_previousaddress: { type: String, default: "" },
    tenantDistrict: { type: String, default: "" },
    tenantaddress: { type: String, default: "" },
    shiftingdate: { type: Date, default: null },
    shiftingaddress: { type: String, default: "" },
    securitydeposit: { type: String, default: "" },
    monthlyrent: { type: String, default: "" },
    waterCharges: { type: String, default: "" },
    paintingCharges: { type: String, default: "" },
    accommodation: { type: String, default: "" },
    appliancesFittings: { type: String, default: "" },
    shippingaddress: { type: String, default: "" },
    selectaffidavits: { type: String, default: "" },
    passportBookletType: { type: String, default: "" },
    givename: { type: String, default: "" },
    surname: { type: String, default: "" },
    maritalStatus: { type: String, default: "" },
    placeofbirth: { type: String, default: "" },
    bloodgroup: { type: String, default: "" },
    gstnumber: { type: String, default: "" },
    businessName: { type: String, default: "" },
    typeoforganisation: { type: String, default: "" },
    organisationType: { type: String, default: "" },
    dateOfIncorporation: { type: Date, default: null },
    pancardproprietorownerpancardnumber: { type: String, default: "" },
    purposepccrequired: { type: String, default: "" },
    assign: { type: String, default: "Select lead user" },
    dob: { type: String, default: "" },
    travellingDate: { type: Date, default: null },
    returningDate: { type: Date, default: null },
    ownerPincode: { type: String, default: "" },
    ownerDistrict: { type: String, default: "" },
    tenantPincode: { type: String, default: "" },
    state: { type: String, default: "" },
    age: { type: String, default: "" },
    PGID: { type: String, default: "" },

    updated_by: { type: String, default: "" },
    paymentStatus: {
      type: String,
      default: "Unpaid",
    },
    source: { type: String, default: "" },
    created_at: { type: Date, default: null },
    returnDate: { type: Date, default: null },
  },
  { timestamps: true }
);

leadSchema.methods.toJSON = function () {
  const leadObject = this.toObject();

  const dateFields = [
    "created_at",
    "registrationDate",
    "returnDate",
    "followupDate",
    "travellingDate",
    "dateOfIncorporation",
    "shiftingdate",
    "updatedAt",
    "createdAt",
    "date",
    "dob",
  ];

  dateFields.forEach((field) => {
    if (leadObject[field]) {
      leadObject[field] = formatDate(leadObject[field]);
    }
  });

  // Format time field using `formatTime`
  if (leadObject.time) {
    leadObject.time = formatTime(leadObject.time);
  }

  return leadObject;
};

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
