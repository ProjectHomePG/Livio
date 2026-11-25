import { getLowestPrice } from './pgServer';

export const MIN_LOCALITY_LISTINGS = 5;

export const CITY_ALIASES = {
  'pg-in-bengaluru': 'pg-in-bangalore',
  'pg-in-gurugram': 'pg-in-gurgaon',
  'pg-in-new-delhi': 'pg-in-delhi',
};

export const CITIES = [
  {
    slug: 'pg-in-bangalore',
    citySlug: 'bangalore',
    name: 'Bangalore',
    displayName: 'Bangalore (Bengaluru)',
    state: 'Karnataka',
    aliases: ['bengaluru', 'bangalore'],
    intro:
      'Bangalore is India’s largest hub for IT parks, startups, and higher education campuses, making PG accommodations around Whitefield, Koramangala, Indiranagar, Electronic City, and Bellandur essential for students and tech professionals.',
    transport:
      'Namma Metro Purple, Green, and Yellow lines, BMTC Vayu Vajra airport buses, and Outer Ring Road tech shuttles connect major PG clusters with ITPL, Embassy TechVillage, and MG Road.',
    highlights: [
      'Strong inventory of single, double, and triple sharing rooms near IT corridors',
      'Options across boys PG, girls PG, and unisex co-living properties',
      'Direct owner enquiries with clear monthly rent breakdowns',
    ],
    localities: [
      {
        slug: 'whitefield',
        name: 'Whitefield',
        keywords: ['whitefield', 'itpl', 'epip'],
        landmarks: ['ITPL (International Tech Park)', 'Hope Farm Junction', 'Phoenix Marketcity'],
        transit: 'Whitefield (Kadugodi) & Hopefarm Purple Line Metro stations',
        intro:
          'Whitefield is one of East Bangalore’s busiest tech corridors, popular among software engineers working at ITPL, EPIP Zone, and Brookefield.',
      },
      {
        slug: 'koramangala',
        name: 'Koramangala',
        keywords: ['koramangala'],
        landmarks: ['Christ University', 'Forum Nexus Mall', 'Sony World Junction'],
        transit: 'BMTC Ring Road corridors and nearby Indiranagar / Silk Board connectivity',
        intro:
          'Koramangala combines startup offices, coaching hubs, and college access with walkable cafes, libraries, and co-living spaces.',
      },
      {
        slug: 'indiranagar',
        name: 'Indiranagar',
        keywords: ['indiranagar', 'hal 2nd stage', 'doopanahalli'],
        landmarks: ['100 Feet Road', 'CMH Road', 'Bagmane Tech Park'],
        transit: 'Indiranagar & Swami Vivekananda Road Purple Line Metro stations',
        intro:
          'Indiranagar offers direct metro connectivity to MG Road and Whitefield, making it a preferred residential pocket for working professionals.',
      },
      {
        slug: 'electronic-city',
        name: 'Electronic City',
        keywords: ['electronic city', 'neeladri', 'konappana'],
        landmarks: ['Infosys Campus', 'Wipro Gate', 'IIIT Bangalore'],
        transit: 'Hosur Road Elevated Expressway & NICE Road',
        intro:
          'Electronic City Phase 1 and Phase 2 host major IT campuses and engineering institutions, offering budget-friendly and mid-range PG stays close to workplaces.',
      },
      {
        slug: 'bellandur',
        name: 'Bellandur',
        keywords: ['bellandur', 'ecospace', 'ecoworld'],
        landmarks: ['RMZ Ecospace', 'Embassy TechVillage', 'Central Mall'],
        transit: 'Outer Ring Road (ORR) bus corridor',
        intro:
          'Bellandur sits directly along the Outer Ring Road tech belt, minimizing daily commute times for professionals at Ecospace and Ecoworld.',
      },
    ],
  },
  {
    slug: 'pg-in-hyderabad',
    citySlug: 'hyderabad',
    name: 'Hyderabad',
    displayName: 'Hyderabad',
    state: 'Telangana',
    aliases: ['hyderabad', 'secunderabad'],
    intro:
      'Hyderabad combines Cyberabad’s global IT campuses with affordable living costs, with concentrated PG and hostel clusters across Gachibowli, Madhapur, HITEC City, Kondapur, and Kukatpally.',
    transport:
      'Hyderabad Metro Blue & Red lines, Outer Ring Road, and TSRTC IT corridor buses link major PG neighborhoods to Mindspace, DLF Cyber City, and Financial District.',
    highlights: [
      'Competitive monthly rents compared with other Tier-1 tech cities',
      'Walking-distance stays near Mindspace, Cyber Towers, and Wipro Circle',
      'Separate gents, ladies, and co-living hostels with Wi-Fi and meal plans',
    ],
    localities: [
      {
        slug: 'gachibowli',
        name: 'Gachibowli',
        keywords: ['gachibowli', 'dlf', 'indira nagar'],
        landmarks: ['DLF Cyber City', 'ISB Hyderabad', 'Financial District'],
        transit: 'Outer Ring Road & Raidurg Metro feeder routes',
        intro:
          'Gachibowli is Hyderabad’s core IT and university district, anchored by Financial District offices, IIIT Hyderabad, and ISB.',
      },
      {
        slug: 'madhapur',
        name: 'Madhapur',
        keywords: ['madhapur', 'ayyappa society'],
        landmarks: ['Mindspace IT Park', 'Inorbit Mall', 'Durgam Cheruvu'],
        transit: 'Madhapur & Durgam Cheruvu Blue Line Metro stations',
        intro:
          'Madhapur and Ayyappa Society form Hyderabad’s densest PG and coliving micro-market within walking distance of Mindspace.',
      },
      {
        slug: 'hitec-city',
        name: 'HITEC City',
        keywords: ['hitec', 'hi-tech', 'cyberabad'],
        landmarks: ['Cyber Towers', 'Raheja Mindspace', 'Shilparamam'],
        transit: 'HITEC City & Raidurg Blue Line Metro stations',
        intro:
          'HITEC City places working professionals minutes from major IT campuses and metro connectivity.',
      },
      {
        slug: 'kondapur',
        name: 'Kondapur',
        keywords: ['kondapur'],
        landmarks: ['Kothaguda Junction', 'Botanical Garden', 'Google & Tech Campuses'],
        transit: 'Gachibowli-Miyapur Road & HITEC City MMTS',
        intro:
          'Kondapur bridges Gachibowli and HITEC City with quieter residential lanes and balanced monthly rents.',
      },
      {
        slug: 'kukatpally',
        name: 'Kukatpally',
        keywords: ['kukatpally', 'kphb', 'jntu'],
        landmarks: ['JNTU Hyderabad', 'KPHB Colony', 'Nexus Hyderabad Mall'],
        transit: 'KPHB Colony & Kukatpally Red Line Metro stations',
        intro:
          'Kukatpally and KPHB are popular with engineering students and budget-conscious professionals commuting via Metro.',
      },
    ],
  },
  {
    slug: 'pg-in-pune',
    citySlug: 'pune',
    name: 'Pune',
    displayName: 'Pune',
    state: 'Maharashtra',
    aliases: ['pune', 'pimpri', 'chinchwad'],
    intro:
      'Pune is a leading destination for university students and IT engineers, with major PG hubs spanning Kharadi, Hinjewadi, Wakad, Viman Nagar, Kothrud, Shivajinagar, and Pimpri.',
    transport:
      'Pune Metro Aqua and Purple lines, PMPML buses, and Pune-Mumbai Expressway access connect educational campuses and IT parks.',
    highlights: [
      'Student-friendly PGs near Shivajinagar, Kothrud, and Viman Nagar',
      'IT-corridor co-living near EON IT Park and Rajiv Gandhi Infotech Park',
      'Single, double, and triple sharing choices across budget tiers',
    ],
    localities: [
      {
        slug: 'kharadi',
        name: 'Kharadi',
        keywords: ['kharadi', 'eon'],
        landmarks: ['EON Free Zone', 'World Trade Center Pune', 'Magarpatta Road'],
        transit: 'Nagar Road BRTS & Ramwadi Metro proximity',
        intro:
          'Kharadi in East Pune hosts EON IT Park and WTC, drawing software professionals looking for modern PG and coliving stays.',
      },
      {
        slug: 'wakad',
        name: 'Wakad',
        keywords: ['wakad'],
        landmarks: ['Hinjewadi Bridge', 'Phoenix Mall of the Millennium', 'Bhumkar Chowk'],
        transit: 'Mumbai-Bangalore Highway & Hinjewadi feeder connectivity',
        intro:
          'Wakad is a preferred residential base next to Hinjewadi IT Park with well-connected streets, groceries, and dining.',
      },
      {
        slug: 'pimpri',
        name: 'Pimpri',
        keywords: ['pimpri', 'chinchwad', 'pcmc'],
        landmarks: ['Pimpri Industrial Belt', 'DY Patil Campus', 'PCMC Bhavan'],
        transit: 'PCMC & Pimpri Purple Line Metro stations',
        intro:
          'Pimpri-Chinchwad combines direct Metro access with affordable student and working-professional accommodations.',
      },
      {
        slug: 'hinjewadi',
        name: 'Hinjewadi',
        keywords: ['hinjewadi'],
        landmarks: ['Rajiv Gandhi Infotech Park Phases 1-3', 'Symbiosis Infotech', 'Wipro Circle'],
        transit: 'Hinjewadi Phase 1-3 IT shuttles & Wakad Flyover',
        intro:
          'Hinjewadi is Pune’s flagship IT park zone, ideal for interns and full-time employees who want short daily commutes.',
      },
      {
        slug: 'viman-nagar',
        name: 'Viman Nagar',
        keywords: ['viman nagar'],
        landmarks: ['Symbiosis Campus', 'Pune Airport', 'Phoenix Marketcity'],
        transit: 'Ramwadi Metro station & Nagar Road',
        intro:
          'Viman Nagar is sought after by university students and aviation/IT professionals for its walkable neighborhood.',
      },
      {
        slug: 'kothrud',
        name: 'Kothrud',
        keywords: ['kothrud'],
        landmarks: ['MIT World Peace University', 'Karve Statue', 'Paud Road'],
        transit: 'Vanaz & Anand Nagar Aqua Line Metro stations',
        intro:
          'Kothrud is a classic Pune student neighborhood with strong metro connectivity and calm residential lanes.',
      },
      {
        slug: 'shivajinagar',
        name: 'Shivajinagar',
        keywords: ['shivajinagar', 'fc road', 'deccan'],
        landmarks: ['COEP', 'Fergusson College Road', 'BMCC'],
        transit: 'Shivajinagar Railway Station & Metro interchange',
        intro:
          'Shivajinagar sits at the heart of Pune’s academic and transit network.',
      },
    ],
  },
  {
    slug: 'pg-in-mumbai',
    citySlug: 'mumbai',
    name: 'Mumbai',
    displayName: 'Mumbai',
    state: 'Maharashtra',
    aliases: ['mumbai', 'navi mumbai', 'thane'],
    intro:
      'Mumbai PG and hostel options help students and professionals manage housing costs across Andheri, Powai, Bandra, Thane, and Navi Mumbai with quick local train and metro links.',
    transport:
      'Mumbai Suburban Railway (Western, Central, Harbour lines) and Mumbai Metro Lines 1, 2A, 3, and 7.',
    highlights: [
      'Furnished PGs near Powai IIT Bombay, Andheri MIDC, and BKC',
      'Thane and Navi Mumbai value stays along suburban rail corridors',
      'Verified listings with transparent sharing and rent tiers',
    ],
    localities: [
      {
        slug: 'andheri',
        name: 'Andheri',
        keywords: ['andheri', 'marol', 'chakala', 'lokhandwala'],
        landmarks: ['SEEPZ', 'Andheri MIDC', 'Andheri Railway Station'],
        transit: 'Western Line & Mumbai Metro Line 1 (Versova-Ghatkopar)',
        intro:
          'Andheri East and West offer unmatched Western Line and Metro connectivity to BKC, Lower Parel, and Powai.',
      },
      {
        slug: 'navi-mumbai',
        name: 'Navi Mumbai',
        keywords: ['navi mumbai', 'vashi', 'nerul', 'kharghar', 'airoli', 'ghatkopar'],
        landmarks: ['Airoli Mindspace', 'Vashi IT Park', 'DY Patil Navi Mumbai'],
        transit: 'Harbour & Trans-Harbour suburban rail lines',
        intro:
          'Navi Mumbai offers larger rooms and structured nodes like Vashi, Airoli, and Kharghar at lower monthly rents than South Mumbai.',
      },
      {
        slug: 'thane',
        name: 'Thane',
        keywords: ['thane', 'ghodbunder', 'majiwada'],
        landmarks: ['Wagle Estate', 'Viviana Mall', 'Hiranandani Estate'],
        transit: 'Thane Junction (Central & Trans-Harbour Line)',
        intro:
          'Thane provides spacious PG and coliving buildings with quick rail links to Powai, Airoli, and Central Mumbai.',
      },
      {
        slug: 'powai',
        name: 'Powai',
        keywords: ['powai', 'hiranandani', 'chandivali'],
        landmarks: ['IIT Bombay', 'Hiranandani Business Park', 'Powai Lake'],
        transit: 'JVLR corridor & Saki Naka / Asalpha Metro stations',
        intro:
          'Powai is home to IIT Bombay and corporate campuses, popular for premium student and tech professional PGs.',
      },
      {
        slug: 'bandra',
        name: 'Bandra',
        keywords: ['bandra', 'khar', 'bkc'],
        landmarks: ['Bandra Kurla Complex (BKC)', 'Pali Hill', 'Bandra Terminus'],
        transit: 'Bandra Station (Western & Harbour Lines)',
        intro:
          'Bandra places finance, media, and consulting professionals close to BKC and Western suburbs.',
      },
    ],
  },
  {
    slug: 'pg-in-delhi',
    citySlug: 'delhi',
    name: 'Delhi',
    displayName: 'Delhi & New Delhi',
    state: 'Delhi',
    aliases: ['delhi', 'new delhi'],
    intro:
      'Delhi hosts India’s largest concentration of university students, civil-service aspirants, and corporate commuters across Karol Bagh, Lajpat Nagar, Dwarka, Rohini, and university corridors.',
    transport:
      'Delhi Metro (Yellow, Blue, Red, Violet, Magenta, Pink lines) and DTC bus routes.',
    highlights: [
      'Student PGs and hostels near coaching hubs and DU corridors',
      'Metro-connected residences in Dwarka, Rohini, and South Delhi',
      'Boys, girls, and unisex stays with meal options',
    ],
    localities: [
      {
        slug: 'rohini',
        name: 'Rohini',
        keywords: ['rohini'],
        landmarks: ['DTU (Delhi Technological University)', 'Rithala', 'Rohini Sector Markets'],
        transit: 'Rohini East, Rohini West & Rithala Red Line Metro stations',
        intro:
          'Rohini serves DTU students and North-West Delhi commuters with affordable PG sectors and Metro access.',
      },
      {
        slug: 'dwarka',
        name: 'Dwarka',
        keywords: ['dwarka'],
        landmarks: ['NSUT', 'GGSIPU Dwarka', 'Vegas Mall'],
        transit: 'Dwarka Sector 9–21 Blue Line & Airport Express Metro',
        intro:
          'Dwarka offers planned residential sectors with PGs for university students and IGI Airport / Gurgaon commuters.',
      },
      {
        slug: 'lajpat-nagar',
        name: 'Lajpat Nagar',
        keywords: ['lajpat nagar', 'amar colony', 'south delhi'],
        landmarks: ['Central Market', 'Moolchand', 'South Delhi Colleges'],
        transit: 'Lajpat Nagar Violet & Pink Line Metro interchange',
        intro:
          'Lajpat Nagar is a prime South Delhi neighborhood combining dual-line Metro access with active markets.',
      },
      {
        slug: 'karol-bagh',
        name: 'Karol Bagh',
        keywords: ['karol bagh', 'old rajinder nagar', 'orn', 'patel nagar'],
        landmarks: ['Old Rajinder Nagar Coaching Hub', 'Ajmal Khan Road', 'Pusa Road'],
        transit: 'Karol Bagh & Rajendra Place Blue Line Metro stations',
        intro:
          'Karol Bagh and adjoining Rajinder Nagar are major residential hubs for UPSC aspirants and Central Delhi students.',
      },
    ],
  },
  {
    slug: 'pg-in-noida',
    citySlug: 'noida',
    name: 'Noida',
    displayName: 'Noida & Greater Noida',
    state: 'Uttar Pradesh',
    aliases: ['noida', 'greater noida'],
    intro:
      'Noida and Greater Noida feature planned sectors packed with IT campuses, media houses, and universities, with high-density PG pockets in Sector 62, Sector 63, Sector 126, and Greater Noida.',
    transport:
      'Delhi Metro Blue Line, Noida Metro Aqua Line, and Noida-Greater Noida Expressway.',
    highlights: [
      'Walkable student PGs near Amity University (Sector 126) and Knowledge Park',
      'Working-professional stays in Sector 62 & 63 IT zones',
      'Competitive rents with AC, Wi-Fi, and 3-time meal plans',
    ],
    localities: [
      {
        slug: 'sector-62',
        name: 'Sector 62',
        keywords: ['sector 62', 'sector-62'],
        landmarks: ['JIIT Noida', 'Symbiosis Noida', 'Stellar IT Park'],
        transit: 'Noida Electronic City & Sector 62 Blue Line Metro stations',
        intro:
          'Sector 62 is Noida’s primary IT and institutional corridor with strong metro access to Delhi.',
      },
      {
        slug: 'sector-63',
        name: 'Sector 63',
        keywords: ['sector 63', 'sector-63'],
        landmarks: ['Sector 63 IT & Software Offices', 'NH-24 Corridor'],
        transit: 'Noida Electronic City Metro station',
        intro:
          'Sector 63 houses hundreds of tech and corporate offices, making adjoining PGs popular for short commutes.',
      },
      {
        slug: 'sector-126',
        name: 'Sector 126',
        keywords: ['sector 126', 'sector-126', 'raipur'],
        landmarks: ['Amity University Noida', 'HCL & Expressway Tech Parks'],
        transit: 'Okhla Bird Sanctuary Magenta Line & Noida Expressway',
        intro:
          'Sector 126 is the hub for Amity students and Expressway IT professionals.',
      },
      {
        slug: 'greater-noida',
        name: 'Greater Noida',
        keywords: ['greater noida', 'knowledge park', 'pari chowk', 'alpha', 'beta'],
        landmarks: ['Knowledge Park I–III', 'Sharda University', 'Galgotias Campus'],
        transit: 'Aqua Line Metro (Knowledge Park II & Pari Chowk)',
        intro:
          'Greater Noida offers large student hostels and budget PG rooms around Knowledge Park colleges.',
      },
    ],
  },
  {
    slug: 'pg-in-gurgaon',
    citySlug: 'gurgaon',
    name: 'Gurgaon',
    displayName: 'Gurgaon (Gurugram)',
    state: 'Haryana',
    aliases: ['gurugram', 'gurgaon'],
    intro:
      'Gurgaon (Gurugram) is NCR’s corporate headquarters belt, with managed PGs and co-living homes concentrated along Golf Course Road, DLF Phase 1–3, Sushant Lok, and Udyog Vihar.',
    transport:
      'Rapid Metro Gurgaon, Delhi Metro Yellow Line (Millennium City Centre / Sikandarpur), and NH-48.',
    highlights: [
      'Executive coliving and PGs near CyberHub, MG Road, and Golf Course Road',
      'Convenient Rapid Metro links to corporate towers',
      'Single and double sharing options for corporate employees',
    ],
    localities: [
      {
        slug: 'golf-course-road',
        name: 'Golf Course Road',
        keywords: ['golf course', 'sector 42', 'sector 43', 'sector 53', 'sector 54'],
        landmarks: ['One Horizon Center', 'Two Horizon Center', 'DLF Phase 5'],
        transit: 'Rapid Metro Phase 1, Sector 42-43 & Sector 53-54 stations',
        intro:
          'Golf Course Road hosts premium corporate towers and well-maintained coliving PGs along Rapid Metro.',
      },
      {
        slug: 'dlf-phase',
        name: 'DLF Phase 1–3',
        keywords: ['dlf phase', 'u block', 's block', 'v block', 'cyber city'],
        landmarks: ['DLF Cyber City', 'CyberHub', 'Ambience Mall'],
        transit: 'Phase 2, Phase 3 & Moulsari Avenue Rapid Metro stations',
        intro:
          'DLF Phase 2 and Phase 3 (including U Block and S Block) provide the closest walking-distance stays to DLF Cyber City.',
      },
      {
        slug: 'sushant-lok',
        name: 'Sushant Lok',
        keywords: ['sushant lok'],
        landmarks: ['HUDA City Centre / Millennium City Centre', 'Galleria Market'],
        transit: 'IFFCO Chowk & Millennium City Centre Yellow Line Metro',
        intro:
          'Sushant Lok offers quieter residential blocks right beside MG Road and Yellow Line Metro.',
      },
      {
        slug: 'udyog-vihar',
        name: 'Udyog Vihar',
        keywords: ['udyog vihar', 'sector 18', 'sector 19', 'sector 21'],
        landmarks: ['Udyog Vihar Phases I–V', 'Ambience Island'],
        transit: 'NH-48 & Moulsari Avenue Rapid Metro',
        intro:
          'Udyog Vihar is ideal for professionals working in Gurgaon’s industrial and BPO/IT parks.',
      },
    ],
  },
  {
    slug: 'pg-in-chennai',
    citySlug: 'chennai',
    name: 'Chennai',
    displayName: 'Chennai',
    state: 'Tamil Nadu',
    aliases: ['chennai'],
    intro:
      'Chennai has one of India’s strongest inventories of paying guest hostels and working women’s/men’s accommodations along OMR, Perungudi, Velachery, Sholinganallur, Guindy, and Anna Nagar.',
    transport:
      'Chennai Metro Blue & Green lines, MRTS suburban trains, and MTC IT corridor buses along Rajiv Gandhi Salai (OMR).',
    highlights: [
      'Largest city inventory on Livio with 170+ listings',
      'Direct stays near OMR IT Parks, Tidel Park, and Guindy Industrial Estate',
      'Dedicated men’s and women’s hostels with South/North Indian meal plans',
    ],
    localities: [
      {
        slug: 'perungudi',
        name: 'Perungudi',
        keywords: ['perungudi'],
        landmarks: ['RMZ Millenia', 'World Trade Center Chennai', 'Tidel Park'],
        transit: 'Perungudi MRTS station & OMR bus corridor',
        intro:
          'Perungudi sits at the gateway of Chennai’s OMR IT corridor, close to WTC and Tidel Park.',
      },
      {
        slug: 'velachery',
        name: 'Velachery',
        keywords: ['velachery'],
        landmarks: ['Phoenix Marketcity', 'IIT Madras Gate', 'Taramani'],
        transit: 'Velachery MRTS & Guindy Metro link',
        intro:
          'Velachery is a prime residential and student hub connecting IIT Madras, Guindy, and OMR.',
      },
      {
        slug: 'sholinganallur',
        name: 'Sholinganallur',
        keywords: ['sholinganallur'],
        landmarks: ['ELCOT SEZ', 'Infosys & Cognizant Campuses'],
        transit: 'OMR IT Expressway & ECR link road',
        intro:
          'Sholinganallur anchors the southern OMR tech belt with abundant budget and modern PG hostels.',
      },
      {
        slug: 'anna-nagar',
        name: 'Anna Nagar',
        keywords: ['anna nagar'],
        landmarks: ['Anna Nagar Tower Park', 'VR Chennai', 'Coaching Institutes'],
        transit: 'Anna Nagar East, Tower & Thirumangalam Green Line Metro',
        intro:
          'Anna Nagar is a clean, Metro-linked hub popular with UPSC/NEET aspirants and West Chennai students.',
      },
      {
        slug: 'omr',
        name: 'OMR (Old Mahabalipuram Road)',
        keywords: ['omr', 'karapakkam', 'navalur', 'siruseri', 'taramani'],
        landmarks: ['Tidel Park', 'SIPCOT IT Park', 'Ramanujan IT City'],
        transit: 'Rajiv Gandhi Salai (OMR) & MRTS stations',
        intro:
          'OMR connects Chennai’s biggest IT SEZs, offering convenient PG stays near every major tech campus.',
      },
      {
        slug: 'guindy',
        name: 'Guindy',
        keywords: ['guindy', 'ekattuthangal', 'saidapet'],
        landmarks: ['Anna University', 'IIT Madras', 'Olympia Tech Park'],
        transit: 'Guindy Metro & Suburban Railway interchange',
        intro:
          'Guindy combines engineering campuses and Olympia Tech Park with Chennai’s central rail/metro hub.',
      },
      {
        slug: 'thoraipakkam',
        name: 'Thoraipakkam',
        keywords: ['thoraipakkam'],
        landmarks: ['OMR Tech Parks', 'Pallavaram-Thoraipakkam Radial Road'],
        transit: 'OMR Radial Road corridor',
        intro:
          'Thoraipakkam offers quick access to Perungudi, Sholinganallur, and Chennai Airport via Radial Road.',
      },
    ],
  },
  {
    slug: 'pg-in-kolkata',
    citySlug: 'kolkata',
    name: 'Kolkata',
    displayName: 'Kolkata',
    state: 'West Bengal',
    aliases: ['kolkata'],
    intro:
      'Kolkata provides affordable PG rooms and hostels centered around New Town, Salt Lake Sector V, and Rajarhat IT corridors as well as South Kolkata colleges.',
    transport:
      'Kolkata Metro Green, Blue, and Orange lines plus AC/non-AC shuttle buses across Salt Lake and New Town.',
    highlights: [
      'Budget-friendly PG options near Sector V IT hub and New Town Action Areas',
      'Easy Metro access to Howrah, Sealdah, and Esplanade',
      'Boys, girls, and co-living accommodations with homestyle meals',
    ],
    localities: [
      {
        slug: 'new-town',
        name: 'New Town',
        keywords: ['new town', 'newtown', 'action area'],
        landmarks: ['Ecospace Business Park', 'Biswa Bangla Gate', 'Axis Mall'],
        transit: 'New Town Expressway & Sector V Metro connectivity',
        intro:
          'New Town offers modern apartment-style PGs and co-living buildings close to Ecospace and Candor TechSpace.',
      },
      {
        slug: 'sector-v',
        name: 'Salt Lake Sector V',
        keywords: ['sector v', 'sector 5', 'webel'],
        landmarks: ['Webel More', 'TCS Gitanjali Park', 'Technopolis'],
        transit: 'Salt Lake Sector V Green Line Metro station',
        intro:
          'Sector V is Kolkata’s IT core with Metro access and walkable PG accommodations.',
      },
      {
        slug: 'salt-lake',
        name: 'Salt Lake (Bidhannagar)',
        keywords: ['salt lake', 'bidhannagar', 'karunamoyee'],
        landmarks: ['City Centre 1', 'Karunamoyee', 'Central Park'],
        transit: 'Karunamoyee, City Centre & Central Park Metro stations',
        intro:
          'Salt Lake blocks provide quiet residential streets right next to Sector V and Metro stations.',
      },
      {
        slug: 'rajarhat',
        name: 'Rajarhat',
        keywords: ['rajarhat', 'chinar park', 'baguiati'],
        landmarks: ['Chinar Park', 'City Centre 2', 'Kolkata Airport'],
        transit: 'VIP Road & New Town connector',
        intro:
          'Rajarhat provides value-oriented PG rooms with fast access to Kolkata Airport and New Town.',
      },
    ],
  },
  {
    slug: 'pg-in-jaipur',
    citySlug: 'jaipur',
    name: 'Jaipur',
    displayName: 'Jaipur',
    state: 'Rajasthan',
    aliases: ['jaipur'],
    intro:
      'Jaipur attracts university students, coaching aspirants, and IT professionals across Mansarovar, Malviya Nagar, Jagatpura, and Vaishali Nagar.',
    transport:
      'Jaipur Metro Pink Line and JCTSL bus routes linking Sitapura, Tonk Road, and Ajmer Road.',
    highlights: [
      'Affordable student hostels and furnished PGs across South & West Jaipur',
      'Close to MNIT, JECRC, Poornima, and coaching hubs',
      'Clear rent and meal options for boys and girls',
    ],
    localities: [
      {
        slug: 'mansarovar',
        name: 'Mansarovar',
        keywords: ['mansarovar'],
        landmarks: ['Mansarovar Metro', 'New Aatish Market', 'VT Road'],
        transit: 'Mansarovar & New Aatish Market Metro stations',
        intro:
          'Mansarovar is one of Jaipur’s largest planned residential neighborhoods with strong Metro access.',
      },
      {
        slug: 'malviya-nagar',
        name: 'Malviya Nagar',
        keywords: ['malviya nagar', 'gopalpura'],
        landmarks: ['MNIT Jaipur', 'World Trade Park', 'Gaurav Tower'],
        transit: 'JLN Marg & Tonk Road corridors',
        intro:
          'Malviya Nagar is ideal for MNIT students, Jaipur airport commuters, and coaching aspirants.',
      },
      {
        slug: 'jagatpura',
        name: 'Jagatpura',
        keywords: ['jagatpura'],
        landmarks: ['JECRC University', 'SKIT', 'Sitapura Industrial Area'],
        transit: 'Mahal Road & Jagatpura Railway Station',
        intro:
          'Jagatpura is Jaipur’s fast-growing university and hostel zone near Mahal Road.',
      },
      {
        slug: 'vaishali-nagar',
        name: 'Vaishali Nagar',
        keywords: ['vaishali nagar'],
        landmarks: ['Amrapali Circle', 'Ajmer Road', 'Gandhi Path'],
        transit: 'Ajmer Road & Vivek Vihar Metro access',
        intro:
          'Vaishali Nagar offers modern PG stays in West Jaipur close to cafes, gyms, and markets.',
      },
    ],
  },
  {
    slug: 'pg-in-ahmedabad',
    citySlug: 'ahmedabad',
    name: 'Ahmedabad',
    displayName: 'Ahmedabad',
    state: 'Gujarat',
    aliases: ['ahmedabad'],
    intro:
      'Ahmedabad offers safe, well-managed PG stays for university students and corporate professionals across Prahlad Nagar, Navrangpura, Vastrapur, and SG Highway.',
    transport:
      'Ahmedabad Metro East-West & North-South corridors and Janmarg BRTS.',
    highlights: [
      'Student PGs near Gujarat University, CEPT, and HL College in Navrangpura',
      'Corporate PGs along SG Highway and Prahlad Nagar',
      'Meals, AC, and Wi-Fi equipped rooms',
    ],
    localities: [
      {
        slug: 'prahlad-nagar',
        name: 'Prahlad Nagar',
        keywords: ['prahlad nagar', 'prahladnagar'],
        landmarks: ['SG Highway Corporate Towers', 'Prahlad Nagar Garden'],
        transit: 'SG Highway & BRTS corridors',
        intro:
          'Prahlad Nagar is West Ahmedabad’s prime corporate residential pocket.',
      },
      {
        slug: 'navrangpura',
        name: 'Navrangpura',
        keywords: ['navrangpura', 'c g road', 'cg road'],
        landmarks: ['Gujarat University', 'CEPT University', 'HL College'],
        transit: 'Gujarat University & Commerce Six Road Metro stations',
        intro:
          'Navrangpura sits at the center of Ahmedabad’s university and coaching ecosystem.',
      },
      {
        slug: 'vastrapur',
        name: 'Vastrapur',
        keywords: ['vastrapur'],
        landmarks: ['IIM Ahmedabad', 'Vastrapur Lake', 'AlphaOne Mall'],
        transit: 'Vastrapur Metro & Drive-In Road',
        intro:
          'Vastrapur offers peaceful residential PGs near IIM Ahmedabad and SG Highway.',
      },
    ],
  },
  {
    slug: 'pg-in-indore',
    citySlug: 'indore',
    name: 'Indore',
    displayName: 'Indore',
    state: 'Madhya Pradesh',
    aliases: ['indore'],
    intro:
      'Indore is Central India’s premier education and IT destination, with popular PG clusters around Vijay Nagar, Bhawarkua, and Rau.',
    transport:
      'Indore iBus BRTS corridor, AB Road, and Super Corridor connectivity.',
    highlights: [
      'Coaching & university hostels around Bhawarkua and DAVV',
      'IT & corporate PGs near Vijay Nagar and Crystal IT Park',
      'Affordable monthly rents with home-style meals',
    ],
    localities: [
      {
        slug: 'vijay-nagar',
        name: 'Vijay Nagar',
        keywords: ['vijay nagar'],
        landmarks: ['C21 Mall', 'Brilliant Convention Centre', 'TCS/Infosys Corridor link'],
        transit: 'Vijay Nagar Square & AB Road BRTS',
        intro:
          'Vijay Nagar is Indore’s modern commercial hub favored by IT employees and MBA students.',
      },
      {
        slug: 'rau',
        name: 'Rau',
        keywords: ['rau'],
        landmarks: ['IIM Indore', 'Medicaps University', 'IPS Academy'],
        transit: 'AB Road & Rau Bypass',
        intro:
          'Rau serves students at IIM Indore and major engineering campuses along AB Road.',
      },
      {
        slug: 'bhawarkua',
        name: 'Bhawarkua',
        keywords: ['bhawarkua', 'bhawarkuan', 'bholaram'],
        landmarks: ['DAVV Takshashila Campus', 'Bholaram Ustad Marg', 'Holkar Science College'],
        transit: 'Bhawarkua Square BRTS station',
        intro:
          'Bhawarkua and Bholaram Ustad Marg form Indore’s busiest student and competitive-exam hostel hub.',
      },
    ],
  },
  {
    slug: 'pg-in-kochi',
    citySlug: 'kochi',
    name: 'Kochi',
    displayName: 'Kochi',
    state: 'Kerala',
    aliases: ['kochi', 'ernakulam'],
    intro:
      'Kochi combines Kerala’s Infopark and SmartCity IT hubs with coastal city convenience, offering PGs in Kakkanad, Edappally, Ernakulam, and Palarivattom.',
    transport:
      'Kochi Metro, Water Metro, and Seaport-Airport Road connecting Kakkanad IT parks with Edappally and MG Road.',
    highlights: [
      'Walking-distance stays near Infopark & SmartCity in Kakkanad',
      'Metro-connected hostels in Edappally, Palarivattom, and Ernakulam',
      'Clean men’s, women’s, and co-living hostels',
    ],
    localities: [
      {
        slug: 'ernakulam',
        name: 'Ernakulam',
        keywords: ['ernakulam', 'mg road', 'kaloor', 'kadavanthra'],
        landmarks: ['Ernakulam Junction', 'MG Road', 'Marine Drive'],
        transit: 'Kochi Metro Central Stations & Ernakulam South/North Rail',
        intro:
          'Ernakulam central neighborhoods offer quick Metro and rail access across Kochi.',
      },
      {
        slug: 'kakkanad',
        name: 'Kakkanad',
        keywords: ['kakkanad', 'infopark', 'smartcity'],
        landmarks: ['Infopark Kochi', 'SmartCity', 'CSEZ'],
        transit: 'Seaport-Airport Road & Infopark Expressway',
        intro:
          'Kakkanad is Kochi’s IT hub, ideal for professionals working at Infopark and SmartCity.',
      },
      {
        slug: 'edappally',
        name: 'Edappally',
        keywords: ['edappally'],
        landmarks: ['Lulu Mall Kochi', 'CUSAT Proximity', 'NH-66 Junction'],
        transit: 'Edappally Kochi Metro station',
        intro:
          'Edappally sits at Kochi’s northern transit junction with direct Metro access.',
      },
      {
        slug: 'palarivattom',
        name: 'Palarivattom',
        keywords: ['palarivattom'],
        landmarks: ['Palarivattom Bypass', 'JLN Stadium'],
        transit: 'Palarivattom Kochi Metro station',
        intro:
          'Palarivattom connects central Ernakulam with Kakkanad Infopark via Civil Line Road.',
      },
    ],
  },
  {
    slug: 'pg-in-nagpur',
    citySlug: 'nagpur',
    name: 'Nagpur',
    displayName: 'Nagpur',
    state: 'Maharashtra',
    aliases: ['nagpur'],
    intro:
      'Nagpur serves central India’s engineering, medical, and MIHAN IT workforce with student-friendly PGs in Dharampeth, Sitabuldi, and Wardha Road.',
    transport:
      'Nagpur Metro Aqua & Orange lines connecting Sitabuldi, Dharampeth, and MIHAN.',
    highlights: [
      'Peaceful student PGs in Dharampeth and central Nagpur',
      'Metro access toward VNIT, AIIMS Nagpur, and MIHAN',
      'Budget-friendly sharing rooms',
    ],
    localities: [
      {
        slug: 'dharampeth',
        name: 'Dharampeth',
        keywords: ['dharampeth', 'shankar nagar', 'ramdaspeth'],
        landmarks: ['VNIT Nagpur Proximity', 'Traffic Park', 'Law College Square'],
        transit: 'Shankar Nagar & Subhash Nagar Aqua Line Metro stations',
        intro:
          'Dharampeth is one of Nagpur’s most sought-after student and residential neighborhoods.',
      },
    ],
  },
];

export const NATIONAL_PAGES = [
  {
    slug: 'pg-in-india',
    kind: 'national',
    h1: 'PG Accommodation in India: Compare Verified Stays Across 14 Cities',
    title: 'PG in India | Compare Paying Guest & Co-Living Stays Across India',
    description:
      'Browse paying guest rooms, student hostels, and co-living spaces across Bangalore, Hyderabad, Pune, Mumbai, Delhi, Noida, Gurgaon, Chennai, and 6 more Indian cities.',
    intro:
      'Livio PG Near Me indexes paying guest, student hostel, and co-living listings across India’s major education and employment hubs. Compare single, double, and triple sharing rents, check resident policies, and enquire directly with property hosts.',
    filter: () => true,
  },
  {
    slug: 'affordable-pg-in-india',
    kind: 'national',
    h1: 'Affordable PG in India: Budget Paying Guest Rooms Under ₹10,000',
    title: 'Affordable PG in India | Budget PG Rooms Under ₹10,000/Month',
    description:
      'Find affordable PG accommodations in India starting under ₹10,000/month. Compare budget boys and girls PGs near colleges, metro stations, and IT corridors.',
    intro:
      'Looking for budget-friendly accommodation without brokerage? Explore affordable paying guest and shared hostel listings across India with monthly options at or under ₹10,000.',
    filter: (pg) => getLowestPrice(pg) > 0 && getLowestPrice(pg) <= 10000,
  },
  {
    slug: 'hostels-in-india',
    kind: 'national',
    h1: 'Hostels & Student Stays in India: Boys, Girls & Co-Living',
    title: 'Hostels in India | Student & Working Professional Hostels Near Me',
    description:
      'Explore boys hostels, girls hostels, and shared paying guest stays near universities, coaching hubs, and tech parks across India.',
    intro:
      'Whether you need a student hostel near campus or a shared stay during an internship, compare verified listings with transparent sharing options, amenities, and locations.',
    filter: () => true,
  },
];

export const CATEGORY_PAGES = [
  {
    slug: 'boys-pg',
    kind: 'category',
    h1: 'Boys PG Near Me: Gents Paying Guest & Hostels Across India',
    title: 'Boys PG Near Me | Gents PG & Boys Hostel Stays in India',
    description:
      'Find boys PG and gents hostel rooms near tech parks, colleges, and metro stations across India. Compare single and shared rents with direct owner contact.',
    intro:
      'Explore dedicated boys PG and gents paying guest listings across 14 Indian cities. Filter by city or budget and check amenities such as Wi-Fi, meals, laundry, and parking.',
    filter: (pg) => (pg.genderType || '').toUpperCase() === 'MALE',
  },
  {
    slug: 'girls-pg',
    kind: 'category',
    h1: 'Girls PG Near Me: Ladies Paying Guest & Women’s Hostels',
    title: 'Girls PG Near Me | Safe Ladies PG & Girls Hostel Stays in India',
    description:
      'Compare girls PG and working women’s hostels across India. View room sharing options, amenities, guest reviews, and locations near campuses and offices.',
    intro:
      'Browse dedicated girls PG and ladies hostel accommodations designed for female students and working professionals, featuring clear resident policies and neighborhood details.',
    filter: (pg) => (pg.genderType || '').toUpperCase() === 'FEMALE',
  },
  {
    slug: 'coliving-pg',
    kind: 'category',
    h1: 'Coliving PG Spaces in India: Furnished Shared & Private Stays',
    title: 'Coliving PG & Co-Living Spaces in India | Furnished Rooms',
    description:
      'Discover co-living PG and unisex shared accommodations across India’s top tech cities with furnished rooms, Wi-Fi, housekeeping, and flexible terms.',
    intro:
      'Co-living spaces combine private or shared furnished rooms with community lounges, high-speed internet, and bundled housekeeping across India’s major IT hubs.',
    filter: (pg) =>
      (pg.genderType || '').toUpperCase() === 'UNISEX' ||
      (pg.description || '').toLowerCase().includes('coliving'),
  },
  {
    slug: 'student-pg',
    kind: 'category',
    h1: 'Student PG & College Hostels Across India',
    title: 'Student PG & Hostels Near Colleges & Universities in India',
    description:
      'Find student PG rooms and hostels near major colleges, coaching centres, and metro stations in Bangalore, Delhi, Pune, Hyderabad, Indore, and Jaipur.',
    intro:
      'Moving to a new city for university or competitive exams? Compare student-friendly PG accommodations with shared room pricing, study-friendly neighborhoods, and meal availability.',
    filter: (pg) => getLowestPrice(pg) <= 12000,
  },
  {
    slug: 'working-professionals-pg',
    kind: 'category',
    h1: 'PG for Working Professionals: Near IT Parks & Metro Hubs',
    title: 'PG for Working Professionals | Furnished Rooms Near IT Parks',
    description:
      'Explore furnished single and double-sharing PG stays for working professionals near ITPL, Cyber City, HITEC City, Kharadi, OMR, and Sector 62.',
    intro:
      'Save commute hours with furnished PG and co-living accommodations positioned close to India’s major IT parks, business districts, and metro stations.',
    filter: (pg) => Boolean(pg.priceSingle || pg.priceDouble || pg.price),
  },
  {
    slug: 'single-sharing-pg',
    kind: 'category',
    h1: 'Single Sharing PG Rooms: Private Rooms for Rent Across India',
    title: 'Single Sharing PG | Private Paying Guest Rooms Across India',
    description:
      'Compare private single-sharing PG rooms across India. Check monthly single-occupancy rent, amenities, and availability near your workplace or college.',
    intro:
      'Prefer privacy without renting an entire unfurnished apartment? Compare single-sharing PG rooms across Indian cities with transparent single-room monthly pricing.',
    filter: (pg) => Number(pg.priceSingle || pg.price || 0) > 0,
  },
  {
    slug: 'pg-under-8000',
    kind: 'budget',
    h1: 'PG Under ₹8,000 Per Month: Budget Shared & Student Stays',
    title: 'PG Under ₹8,000/Month | Budget Paying Guest Rooms in India',
    description:
      'Browse paying guest rooms and hostels available at ₹8,000 per month or less across India. Compare triple and double sharing options.',
    intro:
      'Discover paying guest listings with sharing plans priced at ₹8,000 per month or lower across India’s top student and IT cities.',
    filter: (pg) => {
      const low = getLowestPrice(pg);
      return low > 0 && low <= 8000;
    },
  },
  {
    slug: 'pg-under-10000',
    kind: 'budget',
    h1: 'PG Under ₹10,000 Per Month: Value PG & Hostel Options',
    title: 'PG Under ₹10,000/Month | Affordable Paying Guest Stays in India',
    description:
      'Compare paying guest rooms under ₹10,000 per month in Bangalore, Hyderabad, Pune, Noida, Chennai, Jaipur, and more.',
    intro:
      'Find well-located paying guest rooms under ₹10,000 per month for students and early-career professionals across India.',
    filter: (pg) => {
      const low = getLowestPrice(pg);
      return low > 0 && low <= 10000;
    },
  },
  {
    slug: 'pg-under-15000',
    kind: 'budget',
    h1: 'PG Under ₹15,000 Per Month: Single, Double & Coliving Stays',
    title: 'PG Under ₹15,000/Month | Verified PG & Co-Living Rooms in India',
    description:
      'Explore single, double, and triple sharing PG and co-living accommodations under ₹15,000/month across major Indian cities.',
    intro:
      'Compare furnished PG rooms and co-living stays under ₹15,000/month with clear sharing rates across 14 Indian cities.',
    filter: (pg) => {
      const low = getLowestPrice(pg);
      return low > 0 && low <= 15000;
    },
  },
];

export function findCityByLandingSlug(slug) {
  return CITIES.find((c) => c.slug === slug) || null;
}

export function findLocality(cityObj, localitySlug) {
  if (!cityObj) return null;
  return cityObj.localities.find((l) => l.slug === localitySlug) || null;
}

export function findStaticLanding(slug) {
  return (
    NATIONAL_PAGES.find((p) => p.slug === slug) ||
    CATEGORY_PAGES.find((p) => p.slug === slug) ||
    null
  );
}

export function matchesCity(pg, cityObj) {
  const c = (pg.city || '').trim().toLowerCase();
  return cityObj.aliases.some((alias) => c === alias || c.includes(alias));
}

export function matchesLocality(pg, localityObj) {
  const hay = `${pg.address || ''} ${pg.title || ''}`.toLowerCase();
  return localityObj.keywords.some((kw) => hay.includes(kw.toLowerCase()));
}

export function getAllLandingSlugs() {
  return [
    ...NATIONAL_PAGES.map((p) => p.slug),
    ...CITIES.map((c) => c.slug),
    ...CATEGORY_PAGES.map((p) => p.slug),
  ];
}

export function getAllLocalityParams() {
  const params = [];
  for (const city of CITIES) {
    for (const loc of city.localities) {
      params.push({ landing: city.slug, locality: loc.slug });
    }
  }
  return params;
}

export function getCityLandingSlug(rawCity) {
  const c = (rawCity || '').trim().toLowerCase();
  if (!c) return null;
  const found = CITIES.find((city) => city.aliases.some((a) => c === a || c.includes(a)));
  return found ? found.slug : null;
}

export function findMatchingLocalityForPg(pg) {
  const citySlug = getCityLandingSlug(pg.city);
  if (!citySlug) return null;
  const cityObj = findCityByLandingSlug(citySlug);
  if (!cityObj) return null;
  const loc = cityObj.localities.find((l) => matchesLocality(pg, l));
  return loc ? { city: cityObj, locality: loc } : { city: cityObj, locality: null };
}
