export interface AircraftData {
  mode_s?: string;
  registration?: string;
  type: string;
  manufacturer: string;
  registered_owner_country_name: string;
}
export interface AircraftResult {
  response: {
    aircraft: AircraftData;
  };
}
export interface CallsigneData {
  callsign: string;
  origin: {
    name: string;
    iata_code: string;
  };
  destination: {
    name: string;
    iata_code: string;
  };
}

export interface CallsigResult {
  response: {
    flightroute: CallsigneData;
  };
}
export type SearchResult = AircraftData | CallsigneData;
