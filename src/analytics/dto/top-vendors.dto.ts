export class VendorSummaryDTO {
  id: string;
  name: string;
}

export class CountryAnalyticsDTO {
  countryCode: string;
  vendors: VendorSummaryDTO[];
  documentCount: number;
}
