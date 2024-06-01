// Automotive rules

Vin 'a VIN (Vehicule Identification Number)' = $UPPNUM|17|

LicensePlate 'a license plate number' = $[A-Z0-9-]+

OdbCode 'an ODB2 fault code' = $('P' DEC|4|)
