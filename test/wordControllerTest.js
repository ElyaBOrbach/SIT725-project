const wordController = require('../controllers/wordsController');
const wordModel = require('../models/word');

jest.mock('../models/word');
module.exports = () => {
describe('Word Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWords', () => {
    it('should return word lists for valid categories', async () => {
      req.query = { categories: 'Science,History' };

      wordModel.isCategory.mockResolvedValue(true);
      wordModel.getWords.mockImplementation((categories, callback) => {
        callback(null, {
          Science: [{ word: 'atom' }, { word: 'molecule' }],
          History: [{ word: 'war' }, { word: 'revolution' }],
        });
      });

      await wordController.getWords(req, res);

      expect(wordModel.isCategory).toHaveBeenCalledTimes(2);
      expect(wordModel.isCategory).toHaveBeenCalledWith('Science');
      expect(wordModel.isCategory).toHaveBeenCalledWith('History');
      expect(wordModel.getWords).toHaveBeenCalledWith(
        ['Science', 'History'],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: {
          Science: [{ word: 'atom' }, { word: 'molecule' }],
          History: [{ word: 'war' }, { word: 'revolution' }],
        },
        message: 'Word lists successfully retrieved',
      });
    });

    it('should return 400 if categories are missing', async () => {
      req.query = { categories: null };

      await wordController.getWords(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Word categories is missing in body',
      });
    });

    it('should return 404 if a category is invalid', async () => {
      req.query = { categories: 'InvalidCategory' };

      wordModel.isCategory.mockResolvedValueOnce(false);

      await wordController.getWords(req, res);

      expect(wordModel.isCategory).toHaveBeenCalledWith('InvalidCategory');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Category not found',
      });
    });

    it('should return 500 if there is a database error', async () => {
      req.query = { categories: 'Science,History' };

      wordModel.isCategory.mockResolvedValue(true);
      wordModel.getWords.mockImplementation((categories, callback) => {
        callback({ message: 'Database error' }, null);
      });

      await wordController.getWords(req, res);

      expect(wordModel.getWords).toHaveBeenCalledWith(
        ['Science', 'History'],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should handle empty categories array gracefully', async () => {
      req.query = { categories: '' };

      await wordController.getWords(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Word categories is missing in body',
      });
    });
  });

  describe('getCategories', () => {
    it('should return a list of categories', async () => {
      wordModel.getCategories.mockImplementation((callback) => {
        callback(null, ['Science', 'History', 'Geography']);
      });

      await wordController.getCategories(req, res);

      expect(wordModel.getCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: ['Science', 'History', 'Geography'],
        message: 'Category list successfully retrieved',
      });
    });

    it('should return 500 if there is a database error', async () => {
      wordModel.getCategories.mockImplementation((callback) => {
        callback({ message: 'Database error' }, null);
      });

      await wordController.getCategories(req, res);

      expect(wordModel.getCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should handle empty category list gracefully', async () => {
      wordModel.getCategories.mockImplementation((callback) => {
        callback(null, []);
      });

      await wordController.getCategories(req, res);

      expect(wordModel.getCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        data: [],
        message: 'Category list successfully retrieved',
      });
    });
  });

  describe('addCount', () => {
    it('should increment the count for a valid word and category', async () => {
      req.body = { category: 'Science', word: 'atom' };

      wordModel.addWordCount.mockImplementation((word, category, callback) => {
        callback(null);
      });

      await wordController.addCount(req, res);

      expect(wordModel.addWordCount).toHaveBeenCalledWith(
        'atom',
        'Science',
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Word count updated',
      });
    });

    it('should return 400 if category or word is missing', async () => {
      req.body = { category: null, word: null };

      await wordController.addCount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Answer must contain category and word',
      });
    });

    it('should return 500 if there is a database error', async () => {
      req.body = { category: 'Science', word: 'atom' };

      wordModel.addWordCount.mockImplementation((word, category, callback) => {
        callback({ message: 'Database error' });
      });

      await wordController.addCount(req, res);

      expect(wordModel.addWordCount).toHaveBeenCalledWith(
        'atom',
        'Science',
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error',
      });
    });

    it('should handle case where word count update does nothing', async () => {
      req.body = { category: 'Science', word: 'nonexistentword' };

      wordModel.addWordCount.mockImplementation((word, category, callback) => {
        callback(null);
      });

      await wordController.addCount(req, res);

      expect(wordModel.addWordCount).toHaveBeenCalledWith(
        'nonexistentword',
        'Science',
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Word count updated',
      });
    });
  });
});
}