class HeritageService {
  constructor() {
    // Known heritage areas in Albury (simplified list)
    this.heritageAreas = [
      { name: 'Albury Commercial Core', streets: ['dean', 'swift', 'kiewa', 'townsend', 'olive'] },
      { name: 'Albury Railway Station Precinct', streets: ['railway'] },
      { name: 'East Albury Heritage Area', streets: ['elizabeth', 'wilson', 'david'] },
      { name: 'West Albury Heritage Area', streets: ['guinea', 'macauley', 'pemberton'] }
    ];
    
    // Known heritage listed properties (sample)
    this.heritageProperties = [
      'albury railway station',
      'commercial club albury',
      'murray art museum',
      'albury courthouse',
      'st matthews church',
      'albury post office'
    ];
  }

  checkHeritage(address) {
    if (!address) return { isHeritage: false };

    const addressLower = address.toLowerCase();
    
    // Check heritage areas
    const heritageArea = this.heritageAreas.find(area => 
      area.streets.some(street => addressLower.includes(street))
    );
    
    // Check specific heritage properties
    const isListedProperty = this.heritageProperties.some(prop => 
      addressLower.includes(prop) || prop.includes(addressLower.split(',')[0])
    );
    
    // Check for heritage indicators in address
    const heritageIndicators = ['heritage', 'historic', 'conservation', 'railway', 'church', 'courthouse', 'museum'];
    const hasIndicator = heritageIndicators.some(indicator => addressLower.includes(indicator));
    
    const isHeritage = !!(heritageArea || isListedProperty || hasIndicator);
    
    return {
      isHeritage,
      heritageArea: heritageArea?.name,
      warning: isHeritage ? 'This property may be heritage listed. Additional approvals may be required.' : null,
      recommendation: isHeritage ? 'Contact Albury City Council Heritage Officer before proceeding.' : null
    };
  }
}

module.exports = new HeritageService();