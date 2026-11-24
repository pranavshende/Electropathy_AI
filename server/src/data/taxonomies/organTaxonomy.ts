import { OrganTaxonomyNode } from './types.js';

export const ORGAN_TAXONOMY: OrganTaxonomyNode[] = [
  {
    systemId: 'SYS_DIGESTIVE',
    systemName: 'Digestive & Gastrointestinal System',
    organs: [
      {
        organId: 'ORG_STOMACH',
        organName: 'Stomach',
        synonyms: ['gastric', 'ventricle', 'belly', 'epigastrium'],
        tissues: [
          { tissueId: 'TIS_GASTRIC_MUCOSA', tissueName: 'Gastric Mucosa', cellularTargets: ['parietal cells', 'gastric glands', 'epithelial mucosa'] },
          { tissueId: 'TIS_STOMACH_MUSCLE', tissueName: 'Gastric Muscularis', cellularTargets: ['smooth muscle fibers', 'pyloric sphincter'] }
        ]
      },
      {
        organId: 'ORG_LIVER',
        organName: 'Liver',
        synonyms: ['hepatic', 'hepar'],
        tissues: [
          { tissueId: 'TIS_HEPATIC_PARENCHYMA', tissueName: 'Hepatic Parenchyma', cellularTargets: ['hepatocytes', 'sinusoids', 'Kupffer cells'] },
          { tissueId: 'TIS_BILE_DUCTS', tissueName: 'Biliary Ducts & Canaliculi', cellularTargets: ['cholangiocytes', 'common bile duct'] }
        ]
      },
      {
        organId: 'ORG_GALLBLADDER',
        organName: 'Gallbladder',
        synonyms: ['biliary system', 'cholecyst'],
        tissues: [
          { tissueId: 'TIS_GALLBLADDER_MUCOSA', tissueName: 'Cholecystic Mucosa', cellularTargets: ['epithelial lining', 'bile reservoir'] }
        ]
      },
      {
        organId: 'ORG_INTESTINES',
        organName: 'Intestines (Small & Large)',
        synonyms: ['bowel', 'gut', 'colon', 'duodenum', 'ileum', 'rectum'],
        tissues: [
          { tissueId: 'TIS_INTESTINAL_MUCOSA', tissueName: 'Intestinal Mucosa', cellularTargets: ['enterocytes', 'villi', 'Peyer\'s patches (GALT)', 'colonic epithelium'] },
          { tissueId: 'TIS_INTESTINAL_MUSCLE', tissueName: 'Intestinal Smooth Muscle', cellularTargets: ['circular muscle', 'longitudinal muscle', 'myenteric plexus'] }
        ]
      },
      {
        organId: 'ORG_PANCREAS',
        organName: 'Pancreas',
        synonyms: ['pancreatic gland'],
        tissues: [
          { tissueId: 'TIS_PANCREATIC_ACINI', tissueName: 'Exocrine Acini', cellularTargets: ['digestive enzyme secreting cells'] },
          { tissueId: 'TIS_ISLETS_LANGERHANS', tissueName: 'Endocrine Islets', cellularTargets: ['beta cells', 'alpha cells'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_URINARY',
    systemName: 'Urinary & Renal System',
    organs: [
      {
        organId: 'ORG_KIDNEY',
        organName: 'Kidneys',
        synonyms: ['renal', 'nephros', 'kidney apparatus'],
        tissues: [
          { tissueId: 'TIS_RENAL_PARENCHYMA', tissueName: 'Renal Epithelium & Glomeruli', cellularTargets: ['nephrons', 'renal tubules', 'Bowman\'s capsule'] },
          { tissueId: 'TIS_RENAL_PELVIS', tissueName: 'Renal Pelvis & Calyces', cellularTargets: ['urinary collecting ducts', 'papillae'] }
        ]
      },
      {
        organId: 'ORG_BLADDER',
        organName: 'Urinary Bladder',
        synonyms: ['vesica urinaria', 'cystic'],
        tissues: [
          { tissueId: 'TIS_BLADDER_WALL', tissueName: 'Detrusor Muscle & Mucosa', cellularTargets: ['transitional epithelium', 'smooth detrusor fibers', 'bladder neck'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_LYMPHATIC',
    systemName: 'Lymphatic & Immune System',
    organs: [
      {
        organId: 'ORG_LYMPH_NODES',
        organName: 'Lymph Nodes & Vessels',
        synonyms: ['lymphatics', 'glandular complex', 'scrofulous glands'],
        tissues: [
          { tissueId: 'TIS_LYMPHATIC_CHANNELS', tissueName: 'Lymphatic Endothelium', cellularTargets: ['valvular channels', 'interstitial fluid matrix'] },
          { tissueId: 'TIS_LYMPHOID_TISSUE', tissueName: 'Lymph Node Parenchyma', cellularTargets: ['lymphocytes', 'macrophages', 'germinal centers'] }
        ]
      },
      {
        organId: 'ORG_SPLEEN',
        organName: 'Spleen',
        synonyms: ['lien', 'splenic system'],
        tissues: [
          { tissueId: 'TIS_SPLENIC_PULP', tissueName: 'Red & White Pulp', cellularTargets: ['splenic sinusoids', 'reticuloendothelial tissue'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_RESPIRATORY',
    systemName: 'Respiratory & Pulmonary System',
    organs: [
      {
        organId: 'ORG_LUNGS',
        organName: 'Lungs & Alveoli',
        synonyms: ['pulmonary', 'air cells'],
        tissues: [
          { tissueId: 'TIS_ALVEOLI', tissueName: 'Alveolar Epithelium', cellularTargets: ['type I/II pneumocytes', 'pulmonary capillaries'] }
        ]
      },
      {
        organId: 'ORG_BRONCHI',
        organName: 'Bronchial Tree & Trachea',
        synonyms: ['bronchioles', 'airways', 'wind pipe'],
        tissues: [
          { tissueId: 'TIS_BRONCHIAL_MUCOSA', tissueName: 'Bronchial Mucosa & Smooth Muscle', cellularTargets: ['ciliated epithelial cells', 'goblet cells', 'bronchial muscle'] }
        ]
      },
      {
        organId: 'ORG_UPPER_AIRWAYS',
        organName: 'Nose, Sinuses, Pharynx, Larynx',
        synonyms: ['nasal', 'sinus cavity', 'throat', 'tonsils', 'vocal cords'],
        tissues: [
          { tissueId: 'TIS_NASOPHARYNGEAL_MUCOSA', tissueName: 'Upper Airway Mucosa', cellularTargets: ['sinus epithelium', 'pharyngeal lymphoid ring', 'laryngeal mucosa'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_CARDIOVASCULAR',
    systemName: 'Cardiovascular & Circulatory System',
    organs: [
      {
        organId: 'ORG_HEART',
        organName: 'Heart',
        synonyms: ['cardiac', 'myocardium'],
        tissues: [
          { tissueId: 'TIS_MYOCARDIUM', tissueName: 'Myocardial Tissue', cellularTargets: ['cardiac myocytes', 'conduction bundle'] }
        ]
      },
      {
        organId: 'ORG_ARTERIES',
        organName: 'Arterial System',
        synonyms: ['arteries', 'arterioles', 'systemic arterial circulation'],
        tissues: [
          { tissueId: 'TIS_ARTERIAL_WALL', tissueName: 'Arterial Endothelium & Elastic Lamina', cellularTargets: ['tunica media', 'vascular endothelium'] }
        ]
      },
      {
        organId: 'ORG_VEINS',
        organName: 'Venous & Portal System',
        synonyms: ['veins', 'venules', 'portal venous axis', 'hemorrhoidal plexus'],
        tissues: [
          { tissueId: 'TIS_VENOUS_WALL', tissueName: 'Venous Endothelium & Valves', cellularTargets: ['valve leaflets', 'venous muscularis', 'tunica adventitia'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_NERVOUS',
    systemName: 'Nervous & Cerebrospinal System',
    organs: [
      {
        organId: 'ORG_BRAIN',
        organName: 'Brain & Cerebellum',
        synonyms: ['cerebral', 'encephalon', 'higher nerve centers'],
        tissues: [
          { tissueId: 'TIS_CEREBRAL_CORTEX', tissueName: 'Cerebral Parenchyma & Ganglia', cellularTargets: ['neurons', 'glial matrix', 'synapses'] }
        ]
      },
      {
        organId: 'ORG_SPINAL_CORD',
        organName: 'Spinal Cord & Peripheral Nerves',
        synonyms: ['spinal nerves', 'sensory nerves', 'motor nerves'],
        tissues: [
          { tissueId: 'TIS_NERVE_SHEATH', tissueName: 'Nerve Sheaths & Axons', cellularTargets: ['myelin sheath', 'axolemma', 'perineurium'] }
        ]
      },
      {
        organId: 'ORG_AUTONOMIC',
        organName: 'Autonomic Nervous System (Sympathetic, Parasympathetic, Vagus)',
        synonyms: ['vegetative nerves', 'vagus nerve', 'sympathic', 'vagal reflex'],
        tissues: [
          { tissueId: 'TIS_AUTONOMIC_PLEXUS', tissueName: 'Autonomic Ganglia & Plexuses', cellularTargets: ['celiac plexus', 'vagal nerve branches', 'visceral receptors'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_INTEGUMENTARY',
    systemName: 'Integumentary & Cutaneous System',
    organs: [
      {
        organId: 'ORG_SKIN',
        organName: 'Skin & Subcutaneous Glands',
        synonyms: ['cutaneous', 'dermis', 'epidermis', 'hypodermic cellular tissue'],
        tissues: [
          { tissueId: 'TIS_EPIDERMIS_DERMIS', tissueName: 'Epidermal & Dermal Matrix', cellularTargets: ['keratinocytes', 'sebaceous glands', 'sudoriferous glands', 'cutaneous nerve endings'] }
        ]
      }
    ]
  },
  {
    systemId: 'SYS_MUSCULOSKELETAL',
    systemName: 'Musculoskeletal & Osseous System',
    organs: [
      {
        organId: 'ORG_BONES_JOINTS',
        organName: 'Bones, Joints & Cartilages',
        synonyms: ['osseous', 'skeletal', 'articular', 'cartilage'],
        tissues: [
          { tissueId: 'TIS_BONE_MATRIX', tissueName: 'Osseous & Cartilaginous Matrix', cellularTargets: ['osteocytes', 'chondrocytes', 'periosteum', 'ligaments'] },
          { tissueId: 'TIS_SKELETAL_MUSCLE', tissueName: 'Skeletal Muscular Tissue', cellularTargets: ['myofibers', 'tendons', 'neuromuscular junctions'] }
        ]
      }
    ]
  }
];
