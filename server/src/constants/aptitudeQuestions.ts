import { IAptitudeQuestion } from '../types';

export const APTITUDE_QUESTION_BANK: IAptitudeQuestion[] = [
  // 1. Quantitative Aptitude
  {
    id: 1,
    category: 'Quantitative',
    question: 'A train running at 72 km/hr crosses a stationary platform 200 meters long in 20 seconds. What is the length of the train?',
    options: ['150 meters', '200 meters', '250 meters', '300 meters'],
    correctAnswer: 1, // 200 meters
    explanation: 'Speed = 72 * (5/18) = 20 m/s. Total distance in 20s = 20 * 20 = 400 meters. Length of train = 400 - 200 = 200 meters.'
  },
  {
    id: 2,
    category: 'Quantitative',
    question: 'A and B together can complete a project in 12 days. If A alone takes 20 days, how many days will B alone take to finish the work?',
    options: ['25 days', '30 days', '35 days', '40 days'],
    correctAnswer: 1, // 30 days
    explanation: 'Work rate of B = 1/12 - 1/20 = (5 - 3)/60 = 2/60 = 1/30. Therefore, B alone takes 30 days.'
  },
  {
    id: 3,
    category: 'Quantitative',
    question: 'An API server processes 240 requests per minute. If compute capacity is scaled up by 25%, how many total requests will it process in one hour?',
    options: ['14,400', '16,200', '18,000', '20,000'],
    correctAnswer: 2, // 18,000
    explanation: 'New rate = 240 * 1.25 = 300 req/min. In 1 hour (60 min): 300 * 60 = 18,000 requests.'
  },
  {
    id: 4,
    category: 'Quantitative',
    question: 'A sum of money doubles itself in 8 years at a simple annual interest rate. What is the rate of interest per annum?',
    options: ['10%', '12.5%', '15%', '16.6%'],
    correctAnswer: 1, // 12.5%
    explanation: 'Let Principal be P. Simple Interest = P over 8 years. Rate R = (SI * 100) / (P * T) = (P * 100) / (P * 8) = 12.5%.'
  },
  {
    id: 5,
    category: 'Quantitative',
    question: 'A software package is offered with a 20% promotional discount on its list price. If the company still gains a 25% profit margin on a base cost of $120, what is the list price?',
    options: ['$150.00', '$175.00', '$187.50', '$200.00'],
    correctAnswer: 2, // $187.50
    explanation: 'Selling price = $120 * 1.25 = $150. List price * (1 - 0.20) = $150 => List price = 150 / 0.80 = $187.50.'
  },

  // 2. Logical Reasoning
  {
    id: 6,
    category: 'Logical Reasoning',
    question: 'Identify the next number in this alternating sequence: 7, 10, 8, 11, 9, 12, ...?',
    options: ['7', '10', '12', '14'],
    correctAnswer: 1, // 10
    explanation: 'Alternating pattern: +3, -2, +3, -2, +3, -2. Thus 12 - 2 = 10.'
  },
  {
    id: 7,
    category: 'Logical Reasoning',
    question: 'Pointing to an executive portrait, a tech director says, "I have no siblings, and that person\'s father is my father\'s son." Whose portrait is it?',
    options: ['His father', 'His son', 'His nephew', 'Himself'],
    correctAnswer: 1, // His son
    explanation: 'With no siblings, "my father\'s son" is the speaker himself. Since that person\'s father is the speaker, the portrait is of his son.'
  },
  {
    id: 8,
    category: 'Logical Reasoning',
    question: 'Statements: (1) All cloud microservices use encrypted transports. (2) No unverified endpoints are permitted in production. Conclusion I: All production microservices use encrypted transports. Conclusion II: Unverified endpoints can never be microservices.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both conclusions follow', 'Neither follows'],
    correctAnswer: 0, // Only conclusion I follows
    explanation: 'Since all cloud microservices use encrypted transports, any microservice deployed into production must use encryption. Conclusion II is an invalid overgeneralization.'
  },
  {
    id: 9,
    category: 'Logical Reasoning',
    question: 'In a Caesar-like cryptographic transformation, "SYSTEM" is encoded as "TZTUFN" and "CLIENT" is encoded as "DMJFOV". How is "ROUTER" encoded?',
    options: ['SPVUFS', 'SOVTFS', 'SPVSFS', 'SPVSDQ'],
    correctAnswer: 0, // SPVUFS
    explanation: 'Each character shifts +1 forward in alphabetical order: R->S, O->P, U->V, T->U, E->F, R->S = SPVUFS.'
  },
  {
    id: 10,
    category: 'Logical Reasoning',
    question: 'Five engineers (P, Q, R, S, T) sit in a row facing north. R sits in the exact middle. P is immediately to the left of R. S is at the extreme right end. Who sits between P and the left end?',
    options: ['Q', 'T', 'Cannot be determined without additional info', 'R'],
    correctAnswer: 2, // Cannot be determined (Q or T could be at the left end)
    explanation: 'Positions are: 1, 2(P), 3(R), 4, 5(S). Positions 1 and 4 are occupied by Q and T, but specific assignment cannot be uniquely determined.'
  },

  // 3. Verbal Ability
  {
    id: 11,
    category: 'Verbal Ability',
    question: 'Choose the word that is most nearly OPPOSITE in meaning to: CANDID',
    options: ['Deceptive', 'Frank', 'Pragmatic', 'Explicit'],
    correctAnswer: 0, // Deceptive
    explanation: 'Candid means frank, forthright, and sincere. The opposite is deceptive, evasive, or guarded.'
  },
  {
    id: 12,
    category: 'Verbal Ability',
    question: 'Select the grammatically correct sentence adhering to standard formal engineering documentation:',
    options: [
      'Neither the product lead nor the software engineers was able to replicate the race condition.',
      'Neither the product lead nor the software engineers were able to replicate the race condition.',
      'Neither the product lead or the software engineers was able to replicate the race condition.',
      'Neither the product lead and the software engineers were able to replicate the race condition.'
    ],
    correctAnswer: 1, // were
    explanation: 'In "neither... nor" constructions, the verb agrees with the subject closest to it ("engineers were").'
  },
  {
    id: 13,
    category: 'Verbal Ability',
    question: 'Select the most precise synonym for "DETERMINISTIC" when describing software functions and state machines:',
    options: ['Reproducible and predictable given identical inputs', 'Randomized', 'Tentative', 'Intermittent'],
    correctAnswer: 0, // Reproducible and predictable given identical inputs
    explanation: 'A deterministic algorithm or pure function reliably computes the exact same result given the same set of inputs.'
  },
  {
    id: 14,
    category: 'Verbal Ability',
    question: 'Identify the error segment in the sentence: "The team of five cloud architects (A) / have successfully migrated (B) / the legacy infrastructure (C) / without outage (D)."',
    options: ['Segment A', 'Segment B (have successfully migrated)', 'Segment C', 'Segment D'],
    correctAnswer: 1, // have -> has
    explanation: 'The subject is the singular collective noun "The team", requiring the singular verb "has successfully migrated".'
  },

  // 4. Data Interpretation
  {
    id: 15,
    category: 'Data Interpretation',
    question: 'A software company reports Q1 revenue of $120k with a 20% net margin and Q2 revenue of $160k with a 25% net margin. What is the total combined net profit for both quarters?',
    options: ['$54k', '$60k', '$64k', '$70k'],
    correctAnswer: 2, // $64k
    explanation: 'Q1 Net Profit = 20% of $120k = $24k. Q2 Net Profit = 25% of $160k = $40k. Total Net Profit = $24k + $40k = $64,000.'
  },
  {
    id: 16,
    category: 'Data Interpretation',
    question: 'In an engineering group of 60 developers, 35 know Python, 30 know Go, and 15 know both languages. How many developers know neither Python nor Go?',
    options: ['5', '10', '12', '15'],
    correctAnswer: 1, // 10
    explanation: 'Total knowing at least one = 35 + 30 - 15 = 50. Developers with neither = 60 - 50 = 10.'
  },
  {
    id: 17,
    category: 'Data Interpretation',
    question: 'Following index optimization and query refactoring, median database response latency decreased from 120ms to 36ms. What is the percentage latency reduction?',
    options: ['60%', '65%', '70%', '75%'],
    correctAnswer: 2, // 70%
    explanation: 'Reduction = 120 - 36 = 84ms. Percentage reduction = (84 / 120) * 100 = 70%.'
  },

  // 5. Technical Aptitude & CS Fundamentals
  {
    id: 18,
    category: 'Technical Aptitude',
    question: 'What is the worst-case time complexity of searching for an element in an unindexed Hash Table where severe collisions force all elements into a single linked-list bucket?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 2, // O(n)
    explanation: 'When hash collisions degrade bucket storage to a single linked list, lookup degenerates from average O(1) to linear O(n).'
  },
  {
    id: 19,
    category: 'Technical Aptitude',
    question: 'Which of the following is NOT one of Coffman\'s four necessary conditions required for a system deadlock to occur in operating systems?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctAnswer: 2, // Preemption Allowed
    explanation: 'The Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Allowing preemption prevents or breaks deadlocks.'
  },
  {
    id: 20,
    category: 'Technical Aptitude',
    question: 'In a standard TCP connection establishment between a client and server, what is the exact packet sequence transmitted during the three-way handshake?',
    options: ['SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'SYN -> ACK -> SYN-ACK', 'SYN -> ACK -> FIN'],
    correctAnswer: 0, // SYN -> SYN-ACK -> ACK
    explanation: 'The client sends a SYN packet, the server answers with SYN-ACK, and the client confirms with an ACK packet to establish the TCP session.'
  },
  {
    id: 21,
    category: 'Technical Aptitude',
    question: 'In relational database transactions, which ACID property guarantees that concurrent execution results in a state equivalent to sequential execution?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: 2, // Isolation
    explanation: 'Isolation ensures that concurrent transactions operate independently without interference, ensuring serializable state consistency.'
  },

  // Extended Quantitative Aptitude (IDs 22-26)
  {
    id: 22,
    category: 'Quantitative',
    question: 'An inlet pipe fills a server cooling tank in 10 hours while a drain leak empties it in 15 hours. With both open, how long does it take to fill the empty tank?',
    options: ['20 hours', '25 hours', '30 hours', '35 hours'],
    correctAnswer: 2,
    explanation: 'Net fill rate per hour = 1/10 - 1/15 = (3 - 2)/30 = 1/30. Total fill time = 30 hours.'
  },
  {
    id: 23,
    category: 'Quantitative',
    question: 'If cloud GPU unit pricing increases by 20% and an engineering team cuts active usage hours by 20%, what is the net change in monthly spend?',
    options: ['No change', '4% increase', '4% decrease', '2% decrease'],
    correctAnswer: 2,
    explanation: 'New cost factor = 1.20 * 0.80 = 0.96, which represents a net 4% decrease.'
  },
  {
    id: 24,
    category: 'Quantitative',
    question: 'Two autonomous drones depart from the same base in opposite directions at 14 km/hr and 16 km/hr. After how many hours will they be 90 km apart?',
    options: ['2 hours', '2.5 hours', '3 hours', '3.5 hours'],
    correctAnswer: 2,
    explanation: 'Relative separation speed = 14 + 16 = 30 km/hr. Time = 90 / 30 = 3 hours.'
  },
  {
    id: 25,
    category: 'Quantitative',
    question: 'The average age of 5 engineers on a squad is 26 years. When a senior tech lead joins, the squad average rises to 28 years. How old is the tech lead?',
    options: ['34 years', '36 years', '38 years', '40 years'],
    correctAnswer: 2,
    explanation: 'Total age of 5 = 130. Total age of 6 = 6 * 28 = 168. Tech lead age = 168 - 130 = 38 years.'
  },
  {
    id: 26,
    category: 'Quantitative',
    question: 'In how many distinct ways can all 4 letters of the keyword "CODE" be arranged without repeating any character?',
    options: ['12', '16', '24', '32'],
    correctAnswer: 2,
    explanation: 'Number of permutations of 4 distinct characters = 4! = 4 * 3 * 2 * 1 = 24.'
  },

  // Extended Logical Reasoning (IDs 27-31)
  {
    id: 27,
    category: 'Logical Reasoning',
    question: 'Identify the next number in the geometric progression: 3, 9, 27, 81, ...?',
    options: ['162', '216', '243', '324'],
    correctAnswer: 2,
    explanation: 'Each term is multiplied by 3: 81 * 3 = 243.'
  },
  {
    id: 28,
    category: 'Logical Reasoning',
    question: 'Which item does NOT belong in the same technical category as the others: TCP, UDP, HTTP, JSON?',
    options: ['TCP', 'UDP', 'HTTP', 'JSON'],
    correctAnswer: 3,
    explanation: 'TCP, UDP, and HTTP are network/communication protocols, whereas JSON is a structured data interchange format.'
  },
  {
    id: 29,
    category: 'Logical Reasoning',
    question: 'A is the brother of B. B is the mother of C. D is the father of A. How is D related to C?',
    options: ['Uncle', 'Maternal Grandfather', 'Paternal Grandfather', 'Brother'],
    correctAnswer: 1,
    explanation: 'D is the father of C\'s mother B, making D the maternal grandfather of C.'
  },
  {
    id: 30,
    category: 'Logical Reasoning',
    question: 'An engineer walks 6 km North from the office, turns right, and walks 8 km East. What is the shortest straight-line distance from the office?',
    options: ['10 km', '12 km', '14 km', '8 km'],
    correctAnswer: 0,
    explanation: 'By the Pythagorean theorem: sqrt(6^2 + 8^2) = sqrt(36 + 64) = 10 km.'
  },
  {
    id: 31,
    category: 'Logical Reasoning',
    question: 'Statements: (1) Some backend services expose GraphQL APIs. (2) All GraphQL APIs enforce typed schemas. Conclusion: Some backend services enforce typed schemas.',
    options: ['Definitely follows', 'Does not follow', 'Cannot be determined', 'Contradicts statements'],
    correctAnswer: 0,
    explanation: 'Because some backend services are GraphQL APIs and all GraphQL APIs enforce typed schemas, the conclusion follows directly.'
  },

  // Extended Verbal Ability (IDs 32-37)
  {
    id: 32,
    category: 'Verbal Ability',
    question: 'Choose the word closest in meaning (SYNONYM) to: MITIGATE',
    options: ['Aggravate', 'Alleviate', 'Prohibit', 'Replicate'],
    correctAnswer: 1,
    explanation: 'Mitigate means to lessen the severity or impact of something, matching "alleviate".'
  },
  {
    id: 33,
    category: 'Verbal Ability',
    question: 'Choose the word most nearly OPPOSITE in meaning to: EPHEMERAL',
    options: ['Transient', 'Brief', 'Permanent', 'Volatile'],
    correctAnswer: 2,
    explanation: 'Ephemeral means short-lived or temporary; its direct antonym is permanent.'
  },
  {
    id: 34,
    category: 'Verbal Ability',
    question: 'Choose the correct preposition to complete the engineering report: "The distributed cache remained resilient ___ sudden traffic spikes."',
    options: ['with', 'to', 'at', 'by'],
    correctAnswer: 1,
    explanation: 'The standard idiomatic pairing is "resilient to".'
  },
  {
    id: 35,
    category: 'Verbal Ability',
    question: 'Select the grammatically correct technical sentence:',
    options: [
      'Each of the microservices have their own independent database.',
      'Each of the microservices has its own independent database.',
      'Each of the microservices are having its own database.',
      'Each of the microservices were maintaining their own database.'
    ],
    correctAnswer: 1,
    explanation: '"Each" is singular and takes the singular verb "has" and pronoun "its".'
  },
  {
    id: 36,
    category: 'Verbal Ability',
    question: 'In code reviews, what does "REDUNDANT" mean in the instruction "Remove redundant validation checks"?',
    options: ['Mission-critical', 'Unnecessarily repetitive', 'Asynchronously queued', 'Cryptographically hashed'],
    correctAnswer: 1,
    explanation: 'Redundant denotes something duplicated or no longer needed.'
  },
  {
    id: 37,
    category: 'Verbal Ability',
    question: 'Select the clearest, most direct active-voice statement for an incident postmortem:',
    options: [
      'An investigation into the memory leak was performed by the SRE team.',
      'The SRE team investigated and resolved the memory leak.',
      'It was decided by the SRE team that the memory leak should be looked into.',
      'The resolving of the memory leak was handled via the SRE team.'
    ],
    correctAnswer: 1,
    explanation: '"The SRE team investigated and resolved..." uses crisp active voice with zero filler.'
  },

  // Extended Data Interpretation (IDs 38-44)
  {
    id: 38,
    category: 'Data Interpretation',
    question: 'Monthly active users on a platform grew from 8,000 in January to 10,000 in February. What was the percentage user growth?',
    options: ['20%', '22.5%', '25%', '30%'],
    correctAnswer: 2,
    explanation: 'Growth = (10,000 - 8,000) / 8,000 * 100 = 2,000 / 8,000 * 100 = 25%.'
  },
  {
    id: 39,
    category: 'Data Interpretation',
    question: 'Server telemetry logged 4,320 minutes of downtime out of 43,200 total minutes in a 30-day cycle. What was the server uptime percentage?',
    options: ['88%', '90%', '92%', '95%'],
    correctAnswer: 1,
    explanation: 'Downtime share = 4,320 / 43,200 = 10%. Therefore, uptime = 100% - 10% = 90%.'
  },
  {
    id: 40,
    category: 'Data Interpretation',
    question: 'An agile sprint team delivered 18, 22, 20, and 24 story points across four consecutive sprints. What is their average sprint velocity?',
    options: ['20 points', '21 points', '22 points', '23 points'],
    correctAnswer: 1,
    explanation: 'Average = (18 + 22 + 20 + 24) / 4 = 84 / 4 = 21 story points.'
  },
  {
    id: 41,
    category: 'Data Interpretation',
    question: 'Among 200 placement candidates, 45% cleared Coding, 60% cleared Aptitude, and 25% cleared both. How many cleared at least one round?',
    options: ['140', '150', '160', '170'],
    correctAnswer: 2,
    explanation: 'At least one = 45% + 60% - 25% = 80%. 80% of 200 = 160 candidates.'
  },
  {
    id: 42,
    category: 'Data Interpretation',
    question: 'A $4,000 monthly cloud bill comprises 40% Object Storage, 35% Managed Databases, and 25% Automated Backups. How much more is spent on Object Storage than Backups?',
    options: ['$400', '$500', '$600', '$800'],
    correctAnswer: 2,
    explanation: 'Difference in share = 40% - 25% = 15%. 15% of $4,000 = $600.'
  },
  {
    id: 43,
    category: 'Data Interpretation',
    question: 'Service bandwidth peaks at 120 Mbps at noon and falls to 48 Mbps at midnight. What is the simplified ratio of peak to midnight bandwidth?',
    options: ['3 : 1', '5 : 2', '5 : 3', '2 : 1'],
    correctAnswer: 1,
    explanation: 'Dividing both terms of 120 : 48 by their GCD (24) gives 5 : 2.'
  },
  {
    id: 44,
    category: 'Data Interpretation',
    question: 'An API gateway recorded 500 failed responses across 25,000 total HTTP requests. What is the failure rate percentage?',
    options: ['0.2%', '1%', '2%', '5%'],
    correctAnswer: 2,
    explanation: 'Failure rate = (500 / 25,000) * 100 = 2%.'
  },

  // Extended Technical Aptitude (IDs 45-50)
  {
    id: 45,
    category: 'Technical Aptitude',
    question: 'Which linear data structure operates on the Last-In, First-Out (LIFO) principle and manages function execution frames?',
    options: ['Queue', 'Stack', 'Binary Heap', 'Hash Map'],
    correctAnswer: 1,
    explanation: 'A Stack inserts and removes elements from the top (LIFO), making it ideal for function call frames.'
  },
  {
    id: 46,
    category: 'Technical Aptitude',
    question: 'What is the worst-case search time complexity of a self-balancing Binary Search Tree (such as AVL or Red-Black Tree) containing n nodes?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    explanation: 'Tree height remains strictly O(log n), guaranteeing O(log n) worst-case lookup, insert, and delete.'
  },
  {
    id: 47,
    category: 'Technical Aptitude',
    question: 'Which HTTP status code indicates that a request failed specifically because valid authentication credentials are missing or expired?',
    options: ['201 Created', '401 Unauthorized', '404 Not Found', '503 Service Unavailable'],
    correctAnswer: 1,
    explanation: '401 Unauthorized indicates missing, malformed, or invalid authentication credentials.'
  },
  {
    id: 48,
    category: 'Technical Aptitude',
    question: 'In SQL queries containing aggregate functions, which clause filters grouped rows (e.g., COUNT(*) > 5) AFTER GROUP BY executes?',
    options: ['WHERE', 'ORDER BY', 'HAVING', 'DISTINCT'],
    correctAnswer: 2,
    explanation: 'WHERE filters individual rows before grouping, whereas HAVING filters groups created by GROUP BY.'
  },
  {
    id: 49,
    category: 'Technical Aptitude',
    question: 'How does adding a B-Tree index to a frequently filtered column accelerate SQL SELECT queries?',
    options: [
      'It compresses table row values to zero bytes',
      'It enables logarithmic key lookup instead of a full table scan',
      'It permanently moves all records into CPU registers',
      'It bypasses ACID transaction isolation rules'
    ],
    correctAnswer: 1,
    explanation: 'B-Tree indexes maintain sorted balanced pointers, cutting lookup cost from O(n) scan to O(log n) traversal.'
  },
  {
    id: 50,
    category: 'Technical Aptitude',
    question: 'In operating systems memory management, what happens when a process spends more time paging data between RAM and disk than executing instructions?',
    options: ['Thrashing', 'Pipelining', 'Memoization', 'Spooling'],
    correctAnswer: 0,
    explanation: 'Thrashing occurs when excessive page faults cause continuous swap I/O, severely degrading CPU utilization.'
  }
];
