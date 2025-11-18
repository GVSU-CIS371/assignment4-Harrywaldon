import { defineStore } from "pinia";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase"; 

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: ["Cold", "Iced", "Hot"],
    currentTemp: "Iced",

    bases: [] as any[],
    currentBase: null as any,

    creamers: [] as any[],
    currentCreamer: null as any,

    syrups: [] as any[],
    currentSyrup: null as any,

    savedBeverages: [] as any[],
  }),

  actions: {
    async init() {
      // helper to load any collection
      const loadCollection = async (name: string) => {
        const snap = await getDocs(collection(db, name));
        return snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
      };

      // Load collections
      this.bases = await loadCollection("bases");
      this.creamers = await loadCollection("creamers");
      this.syrups = await loadCollection("syrups");

      // Set default selections
      this.currentBase = this.bases[0] || null;
      this.currentCreamer = this.creamers[0] || null;
      this.currentSyrup = this.syrups[0] || null;
    },

    async makeBeverage(name: string) {
      const newBeverage = {
        name,
        config: {
          temp: this.currentTemp,
          baseId: this.currentBase.id,
          creamerId: this.currentCreamer.id,
          syrupId: this.currentSyrup.id,
        },
      };

      const index = this.savedBeverages.findIndex((b) => b.name === name);
      if (index !== -1) {
        this.savedBeverages[index] = newBeverage;
      } else {
        this.savedBeverages.push(newBeverage);
      }

      await setDoc(doc(db, "beverages", name), newBeverage);
    },

    showBeverage(name: string) {
      const beverage = this.savedBeverages.find((b) => b.name === name);
      if (!beverage) return;

      const { temp, baseId, creamerId, syrupId } = beverage.config;

      this.currentTemp = temp;
      this.currentBase = this.bases.find((b) => b.id === baseId) || this.bases[0];
      this.currentCreamer =
        this.creamers.find((c) => c.id === creamerId) || this.creamers[0];
      this.currentSyrup =
        this.syrups.find((s) => s.id === syrupId) || this.syrups[0];
    },
  },

  persist: true,
});
