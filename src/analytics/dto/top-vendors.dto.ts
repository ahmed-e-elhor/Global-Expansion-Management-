export class TopVendorDTO {
  vendorId: string;
  vendorName: string;
  avgScore: number;
}

export class CountryAnalyticsDTO {
  country: string;
  topVendors: TopVendorDTO[];
  researchDocsCount: number;
}
