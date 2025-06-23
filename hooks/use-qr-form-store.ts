"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface QrFormData {
  url: string;
  text: string;
  email: {
    email: string;
    subject: string;
    body: string;
  };
  sms: {
    phoneNumber: string;
    message: string;
  };
  wifi: {
    ssid: string;
    password: string;
    encryption: string;
    isHidden: boolean;
  };
  vcard: {
    firstName: string;
    lastName: string;
    organization: string;
    title: string;
    phone: string;
    email: string;
    website: string;
    address: string;
  };
  location: {
    address: string;
  };
}

interface QrFormStore {
  formData: QrFormData;
  activeTab: string;
  updateFormData: <T extends keyof QrFormData>(
    type: T,
    data: Partial<QrFormData[T]>,
  ) => void;
  setActiveTab: (tab: string) => void;
  resetFormData: (type?: keyof QrFormData) => void;
  getQrContent: () => string;
}

const initialFormData: QrFormData = {
  url: "",
  text: "",
  email: {
    email: "",
    subject: "",
    body: "",
  },
  sms: {
    phoneNumber: "",
    message: "",
  },
  wifi: {
    ssid: "",
    password: "",
    encryption: "WPA",
    isHidden: false,
  },
  vcard: {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    address: "",
  },
  location: {
    address: "",
  },
};

export const useQrFormStore = create<QrFormStore>()(
  devtools(
    (set, get) => ({
      formData: initialFormData,
      activeTab: "url",

      updateFormData: (type, data) => {
        set((state) => ({
          formData: {
            ...state.formData,
            [type]:
              typeof state.formData[type] === "object"
                ? { ...(state.formData[type] as object), ...data }
                : data,
          },
        }));
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      resetFormData: (type) => {
        if (type) {
          set((state) => ({
            formData: {
              ...state.formData,
              [type]: initialFormData[type],
            },
          }));
        } else {
          set({ formData: initialFormData });
        }
      },

      getQrContent: () => {
        const { formData, activeTab } = get();

        switch (activeTab) {
          case "url":
            return formData.url;
          case "text":
            return formData.text;
          case "email": {
            const { email, subject, body } = formData.email;
            if (!email) return "";

            let emailString = `mailto:${email}`;
            const params: string[] = [];

            if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
            if (body) params.push(`body=${encodeURIComponent(body)}`);

            if (params.length > 0) {
              emailString += `?${params.join("&")}`;
            }

            return emailString;
          }
          case "sms": {
            const { phoneNumber, message } = formData.sms;
            if (!phoneNumber) return "";

            let smsString = `sms:${phoneNumber}`;
            if (message) {
              smsString += `?body=${encodeURIComponent(message)}`;
            }

            return smsString;
          }
          case "wifi": {
            const { ssid, password, encryption, isHidden } = formData.wifi;
            if (!ssid) return "";

            const escapedSsid = ssid.replace(/[\\";,]/g, "\\$&");
            const escapedPassword = password.replace(/[\\";,]/g, "\\$&");
            const hiddenFlag = isHidden ? "true" : "false";

            return `WIFI:T:${encryption};S:${escapedSsid};P:${escapedPassword};H:${hiddenFlag};;`;
          }
          case "vcard": {
            const {
              firstName,
              lastName,
              organization,
              title,
              phone,
              email,
              website,
              address,
            } = formData.vcard;

            if (!firstName && !lastName && !phone && !email) return "";

            const vcard = ["BEGIN:VCARD", "VERSION:3.0"];

            if (firstName || lastName) {
              vcard.push(`FN:${firstName} ${lastName}`.trim());
              vcard.push(`N:${lastName};${firstName};;;`);
            }

            if (organization) vcard.push(`ORG:${organization}`);
            if (title) vcard.push(`TITLE:${title}`);
            if (phone) vcard.push(`TEL:${phone}`);
            if (email) vcard.push(`EMAIL:${email}`);
            if (website) vcard.push(`URL:${website}`);
            if (address) vcard.push(`ADR:;;${address};;;;`);

            vcard.push("END:VCARD");

            return vcard.join("\n");
          }
          case "location": {
            const { address } = formData.location;
            if (!address) return "";

            const encodedAddress = encodeURIComponent(address);
            return `https://maps.google.com/?q=${encodedAddress}`;
          }
          default:
            return "";
        }
      },
    }),
    { name: "qr-form-store" },
  ),
);
