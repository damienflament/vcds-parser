// VAG rules

Chassis 'a VAG chassis code' = @$UPPNUM|2|

Type 'a VAG vehicle, engine or transmission Type code' = @$UPPNUM|3|

Wsc 'a WSC (WorkShop Code)' = $(ShortWsc _ DEC|3| _ DEC|5|)

ShortWsc 'a short WSC (WorkShop Code)' = $DEC|5|

VagCode 'a VAG fault code' = $DEC|5|

SymptomCode 'a fault symptom code' = $DEC|3|

/*
  Part Number
  ===========

  see https://blog.europaparts.com/audi-vw-part-numbers-demystified/

  Main group
  ----------

  1   Engine
  2   Gas Tank, Lines, Exhaust, Heater
  3   Transmission
  4   Front Axle, Differential, Steering
  5   Rear Suspension
  6   Wheels and Brakes
  7   Hand and Foot Levers/Pedals, Safety Covers
  8   Body Parts and Interior Trim
  9   Electrical and Electrical Systems
  0  Accessories (Jacks, Tools, Stickers, and Radio Equipment)

  Subgroup
  --------

  98  repair kit

  Specific number
  ---------------

  0XX   major assembly

  XXy   y is even:  left side
        y is odd:   right side

  Modification code
  -----------------

  X   re-manufactured part

*/
PartNumber 'a part number'
  = type:Type _ group:PartGroup subgroup:PartSubgroup _ number:PartSpecNumber modificationCode:(_ @PartModifCode)?
  { return text() }

PartGroup 'the main group of a part number' = DEC

PartSubgroup 'the subgroup of a part number' = $DEC|2|

PartSpecNumber 'the specific number of a part' = $DEC|3|

PartModifCode 'the modification code of a part number' = UPP
