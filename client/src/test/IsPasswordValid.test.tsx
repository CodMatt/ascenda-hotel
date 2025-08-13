import { describe, test, expect } from 'vitest';
import isPasswordValid from '../lib/IsPasswordValid';

describe('isPasswordValid - Robust boundary tests', () => {
  
  test('EC1: Valid - meets all requirements', () => {
    expect(isPasswordValid("Abcdefg1")).toBe(true);
  });

  test('EC2: Invalid - too short but meets char types', () => {
    expect(isPasswordValid("Abc1")).toBe(false);
  });

  test('EC3: Invalid - no uppercase letter', () => {
    expect(isPasswordValid("abcdefg1")).toBe(false);
  });

  test('EC4: Invalid - no lowercase letter', () => {
    expect(isPasswordValid("ABCDEFG1")).toBe(false);
  });

  test('EC5: Invalid - no digit', () => {
    expect(isPasswordValid("Abcdefgh")).toBe(false);
  });

  test('EC6: Invalid - empty string', () => {
    expect(isPasswordValid("")).toBe(false);
  });

  test('EC7: Invalid - short and missing digit', () => {
    expect(isPasswordValid("abc")).toBe(false);
  });

  test('EC8: Valid - contains special characters', () => {
    expect(isPasswordValid("Abc$efg1")).toBe(true);
  });

  test('EC9: Invalid - contains space', () => {
    expect(isPasswordValid("Abc def1")).toBe(false);
  });

  test('EC10: Invalid - only spaces', () => {
    expect(isPasswordValid("        ")).toBe(false);
  });

  test('EC11: Invalid - trailing space', () => {
    expect(isPasswordValid("Abcdef1 ")).toBe(false);
  });

  test('EC11: Invalid - leading space', () => {
    expect(isPasswordValid(" Abcdef1")).toBe(false);
  });
});
