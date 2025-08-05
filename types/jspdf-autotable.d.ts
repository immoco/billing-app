// my-app/types/jspdf-autotable.d.ts
import "jspdf";
declare module "jspdf" {
  interface jsPDF {
    autoTable: (...args: any[]) => jsPDF;
  }
}