const express = require('express');
const RulesEngine = require('../rules/engine');

const router = express.Router();
const rulesEngine = new RulesEngine();

// GET /api/rules - Retrieve current SEPP rules
router.get('/', (req, res) => {
  try {
    const rules = rulesEngine.getRules();
    
    res.json({
      success: true,
      rules: rules,
      metadata: {
        timestamp: new Date().toISOString(),
        structureTypes: Object.keys(rules),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Error retrieving rules:', error);
    res.status(500).json({
      error: 'Failed to retrieve rules',
      message: 'Unable to load SEPP rules configuration'
    });
  }
});

// GET /api/rules/:structureType - Get rules for specific structure type
router.get('/:structureType', (req, res) => {
  try {
    const { structureType } = req.params;
    const rules = rulesEngine.getRules();
    
    if (!rules[structureType]) {
      return res.status(404).json({
        error: 'Structure type not found',
        message: `No rules found for structure type: ${structureType}`,
        availableTypes: Object.keys(rules)
      });
    }

    res.json({
      success: true,
      structureType: structureType,
      rules: rules[structureType],
      metadata: {
        timestamp: new Date().toISOString(),
        ruleCount: Object.keys(rules[structureType]).length
      }
    });
  } catch (error) {
    console.error('Error retrieving structure rules:', error);
    res.status(500).json({
      error: 'Failed to retrieve structure rules',
      message: 'Unable to load rules for specified structure type'
    });
  }
});

// POST /api/rules/reload - Reload rules from configuration file
router.post('/reload', (req, res) => {
  try {
    const rules = rulesEngine.reloadRules();
    
    res.json({
      success: true,
      message: 'Rules reloaded successfully',
      rules: rules,
      metadata: {
        timestamp: new Date().toISOString(),
        structureTypes: Object.keys(rules)
      }
    });
  } catch (error) {
    console.error('Error reloading rules:', error);
    res.status(500).json({
      error: 'Failed to reload rules',
      message: 'Unable to reload SEPP rules configuration'
    });
  }
});

module.exports = router;
