const express = require('express');
const Joi = require('joi');
const RulesEngine = require('../rules/engine');
const { saveCheckpoint } = require('../middleware/checkpoint');

const router = express.Router();
const rulesEngine = new RulesEngine();

// Validation schema
const assessmentSchema = Joi.object({
  property: Joi.object({
    type: Joi.string().valid('urban', 'rural').required(),
    lotSize: Joi.number().positive().required(),
    zoning: Joi.string().optional(),
    address: Joi.string().allow('').optional(),
    heritageOverlay: Joi.boolean().optional(),
    floodOverlay: Joi.boolean().optional(),
    bushfireProne: Joi.boolean().optional(),
    hasEnvironmentalOverlay: Joi.boolean().optional(),
    hasRestrictions: Joi.boolean().optional(),
    restrictionSummary: Joi.string().allow('').optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional()
    }).optional()
  }).required(),
  proposal: Joi.object({
    structureType: Joi.string().valid('shed', 'patio', 'pergola', 'carport', 'deck').required(),
    height: Joi.number().positive().required(),
    floorArea: Joi.number().positive().required(),
    distanceFromBoundary: Joi.number().min(0).required()
  }).required()
});

// POST /api/assess - Submit development proposal for assessment
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = assessmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }

    const { property, proposal } = value;

    // Assess the proposal using rules engine
    const assessment = rulesEngine.assessProposal(property, proposal);

    // Save checkpoint
    await saveCheckpoint({
      timestamp: new Date().toISOString(),
      input: { property, proposal },
      output: assessment,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Return assessment result
    res.json({
      success: true,
      assessment: {
        recommendation: assessment.recommendation,
        reasoning: assessment.reasoning,
        clauses: assessment.clauses,
        conditions: assessment.conditions,
        failedConditions: assessment.failedConditions
      },
      metadata: {
        timestamp: new Date().toISOString(),
        structureType: proposal.structureType,
        propertyType: property.type
      }
    });

  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({
      error: 'Assessment failed',
      message: 'Unable to process development proposal'
    });
  }
});

// GET /api/assess/validate - Validate input without assessment
router.post('/validate', (req, res) => {
  const { error, value } = assessmentSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      valid: false,
      errors: error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }))
    });
  }

  res.json({
    valid: true,
    data: value
  });
});

module.exports = router;
