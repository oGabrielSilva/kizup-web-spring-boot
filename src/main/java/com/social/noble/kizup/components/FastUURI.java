package com.social.noble.kizup.components;

import java.util.Random;

/**
 * ATENÇÃO!!
 * Não utilize essa classe para gerar UUID
 * 
 * @apiNote
 *          UURI -> Universally Unique Random Identifier
 */
public class FastUURI {
    private static String[] BASE = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    public static String getWithLength(int length) {
        Random rand = new Random();
        String base = "";
        for (int i = 0; i < length; i++) {
            base += BASE[rand.nextInt(BASE.length)];
            if (i < length - 1) {
                base += "-";
            }
        }
        return base;
    }

    public static String getWithLength(int length, int numberOfStrokes) {
        Random rand = new Random();
        String base = "";
        for (int i = 0; i <= numberOfStrokes; i++) {
            for (int j = 0; j < length; j++) {
                base += BASE[rand.nextInt(BASE.length)];
            }
            if (i < numberOfStrokes) {
                base += "-";
            }
        }
        return base;
    }

    public static String getNormal() {
        int length = 16;
        int numberOfStrokes = 4;
        Random rand = new Random();
        String base = "";
        for (int i = 0; i <= numberOfStrokes; i++) {
            for (int j = 0; j < length; j++) {
                base += BASE[rand.nextInt(BASE.length)];
            }
            if (i < numberOfStrokes) {
                base += "-";
            }
        }
        return base;
    }
}
