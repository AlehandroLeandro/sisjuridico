package sisjuridico.carbocat.exception;

public class ResorceNotFoundException extends RuntimeException {
    public ResorceNotFoundException(String message) {
        super(message);
    }

    public static ResorceNotFoundException byId(Class<?> resourceClass, Object id){
        return byAttribute(resourceClass, "id", id);
    }

    private static ResorceNotFoundException byAttribute(Class<?> resourceClass, String attribute, Object value) {
        return new ResorceNotFoundException(
                resourceClass.getSimpleName()
                + " not found with "
                + attribute
                + ": "
                + value
        );
    }

}
